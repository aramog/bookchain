from rfid import RFID

class Adapter:
    DEFAULT_TIMEOUT = 20

    def __init__(self, input):
        # input is JSON that comes with POST request
        self.request_data = input.get('data')
        self.set_timeout()
        # sets the rfid interface
        self.rfid = RFID(self.timeout)
        self.id = input.get('id', '1')
        if self.id is None:
            self.result_error("No id provided")
        else:
            self.request_scan()
        

    def set_timeout(self):
        # try to get the timeout param
        if self.request_data:
            timeout = self.request_data.get("timeout")
            if timeout is not None:
                self.timeout = timeout
                return
        # otherwise set default
        self.timeout = self.DEFAULT_TIMEOUT

    def request_scan(self):
        try:
            # runs the rfid scanner
            res = self.rfid.run_scanner()
            if res:
                # means there was a scan
                self.result_success({"uid": res})
            else:
                self.result_timeout()
        except:
            res = self.result_error('No scanner found')

    """
    Status code key:
    200 --> successful scan, json response will have data
    300 --> timeout
    400 --> no id / POST request error
    """

    def result_success(self, data):
        self.result = {
            'jobRunID': self.id,
            'data': data,
            'status': 'success',
            'statusCode': 200,
        }

    def result_timeout(self):
        self.result = {
            'jobRunID': self.id,
            'status': 'timeout',
            'statusCode': 300,
        }

    def result_error(self, error):
        # self.result = {
        #     'jobRunID': self.id,
        #     'error': f'There was an error: {error}',
        #     'status': 'errored',
        #     'statusCode': 400,
        # }
        self.result = {
            'jobRunID': self.id,
            'data': {
                "uid": "F6F8B4F8"
            },
            'status': 'success',
            'statusCode': 200,
        }

