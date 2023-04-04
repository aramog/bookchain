import os
import time
import serial

class RFID:
	def __init__(self, timeout):
		# sets the timeout
		self.timeout = timeout
		# sets up the serial port arduino interface
		self.get_hardware()
		# sets up the parser state machine
		self.parser = Parser()

	def get_hardware(self):
		"""
		Will find arduino USB interface, and init a serial interface.
		"""
		# finds the port that the arduino is on
		prefix="tty.usbmodem" # device name will always start with this
		arduino_name = None # placeholder for error checkings
		devs = os.listdir("/dev")
		for d in devs:
			if d[:len(prefix)] == prefix:
				arduino_name = d
				break
		# TODO: fix this error checking
		try:
			print("FOUND ARDUINO INTERFACE AT " + arduino_name)
		except:
			print("ERROR: arduino not detected")
			#raise TypeError
		# connect to arduino
		self.ser = serial.Serial('/dev/'+arduino_name, timeout = self.timeout)

	def run_scanner(self):
		"""
		Will listen for bytes over the serial port and step the state machine.
		Terminates when the state machine finds a UID or timeout, whichever is first.
		"""
		tic = time.time() # how we reference a timeout
		# loops till timeout or UID found
		while(True):
			if time.time() - tic > self.timeout:
				return None
			# get the next byte from serial
			next_byte = self.ser.read(1)
			# step the server state
			uid = self.parser.step_state(next_byte)
			if uid:
				# means we found a uid
				return uid

class Parser:
	SYNC = [b':', b'D', b'I', b'U']
	SYNC_LENGH = len(SYNC) # 'UID:'
	ID_LENGTH = 8 # 4 bytes * 2 chars / byte = 8 chars
	def __init__(self):
		# state will store a mapping from device id --> list of scan times
		self.server_state = dict()
		# internal state vars that parses the serial output for arduino
		# basically looking for sync pattern 'UID: ' to trigger a scan
		self.reset_state()

	def reset_state(self):
		# bytes_buffer useful for finding the sync patter 'UID:'
		self.bytes_buffer = [0]*self.SYNC_LENGH # will store enough bytes to check for sync
		self.sync_found = False
		self.num_id_bytes_parsed = 0
		self.parsed_id = []

	def step_state(self, step_byte):
		"""
		Steps the internal state of the progam based on the byte 
		sent from the arduino serial port.
		"""
		if self.sync_found:
			# means that we're currently parsing the id
			# skip any space
			if step_byte == b' ':
				return
			# otherwise append step_byte to id
			self.parsed_id.append(step_byte)
			self.num_id_bytes_parsed += 1
			# check if we're done parsing
			if self.num_id_bytes_parsed == self.ID_LENGTH:
				uid = self.store_state() # stores the ID with timestamp
				self.reset_state() # resets internal state machine
				return uid

		else:
			# adds to bytes buffer
			self.bytes_buffer.insert(0, step_byte)
			# deletes hanging byte
			self.bytes_buffer = self.bytes_buffer[:self.SYNC_LENGH]
			# checks if the sync pattern was found
			if self.check_sync():
				# sets the flags
				self.sync_found = True

	def check_sync(self):
		"""
		Returns true iff the bytes buffer = [':', 'D', 'I', 'U']
		"""
		return all([e == a for e, a in zip(self.SYNC, self.bytes_buffer)])

	def store_state(self):
		"""
		CALLED ONLY WHEN AN ID HAS BEEN FULLY PARSED
		Adds the id to server_state with current timestamp
		"""
		# converts parsed_id to chars
		parsed_chars = [str(s).split("'")[1] for s in self.parsed_id]
		uid = ''.join(parsed_chars)
		if uid not in self.server_state:
			self.server_state[uid] = {'latest_scan':0, 'all_scans':[]}
		curr_time = time.time()
		self.server_state[uid]['all_scans'].append(curr_time)
		self.server_state[uid]['latest_scan'] = curr_time
		print("FOUND UID: updating server state")
		return uid
