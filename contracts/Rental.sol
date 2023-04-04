// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

contract Rental {
	address public borrower;
	address public libraryAddress;
	// rental params:
	uint256 public daysOut; // how many days the book has been currently checked out for
	uint256 public rentalPeriod; // how long the rental is supposed to last
	uint256 public lateFee; // late fee per day the book is late
	uint256 public totalChargedFees; // how many fees have been charged in total

	constructor(address _borrower, uint256 _rentalPeriod, uint256 _lateFee) public {
		borrower = _borrower;
		libraryAddress = msg.sender;
		daysOut = 0;
		rentalPeriod = _rentalPeriod;
		lateFee = _lateFee;
	}
	
	/**
	 * Function is meant to be called everyday by the libraryAddress.
	 * Increments the daysOut, and charges any applicable fees
	 */
	function dailyCall() public {
		// only libraryAddress can call this function
		assert(libraryAddress == msg.sender); 
		// increment days out
		daysOut += 1;
		if (daysOut <= rentalPeriod) {
			// means there are no fees to charge, so return
			return;
		}
		// TODO: charge the lateFee
	}
	
	function getRentalStats() public view returns(uint256[3] memory) {
	    return [daysOut, rentalPeriod, lateFee];
	}

	/**
	 * Called by libraryAddress when the book is checked in. 
	 * Will send all collected fees to the bookOwner.
	 */
	function closeRental(address payable bookOwner) public {
		// only libraryAddress can call this function
		assert(libraryAddress == msg.sender);
		// destroys contract and sends all balance to the libraryAddress
		selfdestruct(bookOwner);
	}
}