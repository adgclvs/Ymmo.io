// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";
import "./Bank.sol";

contract Ymmo is Ownable {
    uint128 private valueOfYmmo;
    uint64 private indexOfYmmo;
    uint64 private valueIncome;
    Token private tokenContract;
    Bank private bank;

    constructor(uint128 _valueOfYmmo, uint64 _indexOfYmmo, address _bankAddress) Ownable(msg.sender) {
        valueOfYmmo = _valueOfYmmo;
        indexOfYmmo = _indexOfYmmo;
        bank = Bank(_bankAddress);
        string memory name = "YMMO";
        string memory symbol = string(abi.encodePacked("YMMO_", Strings.toString(_indexOfYmmo)));
        tokenContract = new Token(_valueOfYmmo, name, symbol);
    }

    function buyTokens(uint256 usdcAmount) external {
        require(usdcAmount > 0, "You need to send some USDC");

        uint256 initialBalance = bank.usdcContract().balanceOf(address(bank));
        bank.deposit(msg.sender, usdcAmount);

        uint256 finalBalance = bank.usdcContract().balanceOf(address(bank));
        require(finalBalance - initialBalance == usdcAmount, "USDC deposit not detected in bank");

        uint256 amountToBuy = usdcAmount; // Example rate: 1 YMmo = 1 USDC
        require(tokenContract.balanceOf(address(this)) >= amountToBuy, "Not enough tokens in the reserve");

        // Transfer YMmo tokens from the contract to the buyer
        bool tokenSuccess = tokenContract.transfer(msg.sender, amountToBuy);
        require(tokenSuccess, "Token transfer failed");
    }

    function setPercentageIncome(uint64 _valueIncome) external onlyOwner {
        valueIncome = _valueIncome;
    }

    function getIncome() external {
        uint256 tokenBalance = tokenContract.balanceOf(msg.sender);
        require(tokenBalance > 0, "No YMmo tokens owned");

        uint256 totalSupply = tokenContract.totalSupply();
        uint256 userShare = (tokenBalance * 10 ** 2) / totalSupply;
        uint256 income = (userShare * valueIncome) / (10 ** 2);

        bank.transferUSDC(msg.sender, income);
    }
}
