// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 public feePercentage; // Fee in basis points (e.g., 100 = 1%)

    event TransactionFeeChanged(uint256 newFee);

    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000 * 10 ** decimals());  // Mint initial tokens to deployer
        feePercentage = 100; // Default 1%
    }

    function setTransactionFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee too high (max 5%)"); // Limit to 5%
        feePercentage = newFee;
        emit TransactionFeeChanged(newFee);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        uint256 fee = (amount * feePercentage) / 10000;
        require(amount > fee, "Amount too low for fee"); // Prevent negative transfers

        uint256 amountAfterFee = amount - fee;
        _transfer(msg.sender, recipient, amountAfterFee);
        _transfer(msg.sender, owner(), fee); // Send fee to contract owner

        return true;
    }
}
