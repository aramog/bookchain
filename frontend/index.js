const ethereumButton = document.getElementById('connectWallet');
const getAccountsResult = document.getElementById('getAccountsResult');
const checkOutButton = document.getElementById('checkout');
const checkInButton = document.getElementById('checkin');
const contributeButton = document.getElementById('contribute');
const bookTitle = document.getElementById('bookTitle');
const hskButton = document.getElementById('hskButton');
const outRentals = document.getElementById('outstandingRentals');
const updateButton = document.getElementById('updateRentals');
const loadingBar = document.getElementById('loadingBar');

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


const initialize = async () => {
	// connect to the library contract
	let libraryContract
	let libraryInstance
	const libraryABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkCancelled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkFulfilled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkRequested", "type": "event" }, { "inputs": [], "name": "checkIn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "checkOut", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "title", "type": "string" } ], "name": "contribute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "_requestId", "type": "bytes32" }, { "internalType": "bytes32", "name": "uid", "type": "bytes32" } ], "name": "fulfill", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rentalHousekeeping", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "requestLatestScan", "outputs": [ { "internalType": "bytes32", "name": "requestId", "type": "bytes32" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "allBooks", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "name": "bookCollection", "outputs": [ { "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bool", "name": "rented", "type": "bool" }, { "internalType": "address", "name": "currentHolder", "type": "address" }, { "internalType": "address payable", "name": "contributor", "type": "address" }, { "internalType": "contract Rental", "name": "rentalContract", "type": "address" }, { "internalType": "uint256", "name": "feesCollected", "type": "uint256" }, { "internalType": "string", "name": "title", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "_uid", "type": "bytes32" } ], "name": "inCollection", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "numBooks", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ]
	const libraryAddress = "0xA305effF46696a628100064564dc226de15aC133"

	libraryContract = web3.eth.contract(libraryABI);
	libraryInstance = await libraryContract.at(libraryAddress)
	console.log(libraryInstance)

	// sets up the rental contract interface
	rentalAgreementABI = [ { "inputs": [ { "internalType": "address", "name": "_borrower", "type": "address" }, { "internalType": "uint256", "name": "_rentalPeriod", "type": "uint256" }, { "internalType": "uint256", "name": "_lateFee", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "borrower", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "bookOwner", "type": "address" } ], "name": "closeRental", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "dailyCall", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "daysOut", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRentalStats", "outputs": [ { "internalType": "uint256[3]", "name": "", "type": "uint256[3]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lateFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "libraryAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rentalPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalChargedFees", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];

	rentalContract = web3.eth.contract(rentalAgreementABI)
	let rentalInstance

	let account
	
	ethereumButton.addEventListener('click', () => {
		//Will Start the metamask extension
		getAccount();
	});

	async function getAccount() {
		const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
		getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';
		account = accounts[0];
	}

	async function printLoadingBar() {
		// prints the rfid loading bar for 12.5s
		var template = "Loading RFID scanner: "
		var toPrint
		var numTokens = 25
		for (var i = 0; i<=numTokens; i++) {
			toPrint = template
			for (var j = 0; j < i; j++) toPrint += "#"
			for (j = 0; j < numTokens - i; j++) toPrint += "_"
			loadingBar.innerHTML = toPrint
			await sleep(500)
		}
		// prints to scan
		loadingBar.innerHTML = "----> Scan book now <----"
		await sleep(15000)
		loadingBar.innerHTML = ""

	}

	checkOutButton.addEventListener('click', () => {
		
		console.log("here2")
		libraryInstance.checkOut.sendTransaction({from: account},
			(error, result) => {
				if (!error) {
					console.log(result);
					printLoadingBar();
				}
				else
					console.log(error);
			})

	});

	checkInButton.addEventListener('click', () => {
		libraryInstance.checkIn.sendTransaction({from: account},
			(error, result) => {
				if (!error) {
					console.log(result);
					printLoadingBar();
				}
				
				else
					console.log(error);
			})

	});

	contributeButton.addEventListener('click', () => {
		libraryInstance.contribute.sendTransaction(bookTitle.value, {from: account},
			(error, result) => {
				if (!error) {
					console.log(result);
					printLoadingBar();
				}
				else
					console.log(error);
			})
	});

	hskButton.addEventListener('click', () => {
		console.log('here')
		libraryInstance.rentalHousekeeping.sendTransaction({from: account},
			(error, result) => {
				if (!error)
					console.log(result);
				else
					console.log(error);
	  	})
	});		

	updateButton.addEventListener('click', async () => {
		checkedOut = "" 
		console.log("ALL BOOKS IN LIBRARY: ")
		libraryInstance.numBooks({from: account},
			async (error, result) => {
				if (!error) {
					for (var i = 0; i < result.c[0]; i++) {
						libraryInstance.allBooks(i, {from: account},
							async (error, result) => {
								if (!error) {
									libraryInstance.bookCollection(result, {from: account},
										async (error, result) => {
											if (!error) {
												console.log(result)
												let bookName = result[6]
												if (result[2] == account) {
													var rentalContractAddress = result[4]
													rentalInstance = await rentalContract.at(rentalContractAddress)
													console.log(rentalInstance)
													rentalInstance.getRentalStats({from:account}, (error, result) => {
														if (result) {
															/*
															TODO: RESULT IS THE RENTAL DETAILS FOR THIS USER
															PRINT RENTAL DETAILS IN A TABLE ON THE SCREEN
															result[0] --> days left in rental
															result[1] --> total rental length
															result[2] --> daily late fee
															(also useful) bookName --> name of book
															*/
															console.log(result)
														}
														else console.log(error)
													})
													// outRentals.innerHTML = result[0]
													checkedOut = checkedOut.concat(bookName, ", ")
													outRentals.innerHTML = checkedOut;
												}
											}
											else console.log(error);
								  })
								}
								else console.log(error);
					  })
					}
					
				}
				else console.log(error);
	  	})
		//outRentals.innerHTML = checkedOut;
		
	});



}


window.addEventListener('DOMContentLoaded', initialize)
