// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./Token.sol";

contract Ymmo is Ownable, ReentrancyGuardUpgradeable {
    uint128 public valueOfYmmo;
    uint64 public indexOfYmmo;
    uint64 public valueIncome;
    IERC20 public tokenContract;

    event TokensPurchased(address buyer, uint256 amount, uint256 ethSpent);
    event IncomeDistributed(address _address, uint256 _amount);

    constructor(uint128 _valueOfYmmo, uint64 _indexOfYmmo) Ownable(msg.sender) {
        require(_valueOfYmmo > 0, "Value of Ymmo must be greater than 0");
        valueOfYmmo = _valueOfYmmo;
        indexOfYmmo = _indexOfYmmo;
        string memory name = "YMMO";
        string memory symbol = string(abi.encodePacked("YMMO_", Strings.toString(_indexOfYmmo)));
        tokenContract = IERC20(new Token(_valueOfYmmo, name, symbol));
    }

    function buyTokens() external payable {
        require(msg.value > 0, "You need to send some ETH");

        // Assuming 1 ETH = 2000 USD and 1 token = 1 USD for this example
        uint256 ethToUsd = 2000; // This should be updated with a real-time feed or oracle in a real use case
        uint256 amountToBuy = (msg.value * ethToUsd) / (1 ether);

        require(tokenContract.balanceOf(address(this)) >= amountToBuy, "Not enough tokens in the reserve");

        // Transfer YMmo tokens from the contract to the buyer
        bool tokenSuccess = tokenContract.transfer(msg.sender, amountToBuy);
        require(tokenSuccess, "Token transfer failed");

        emit TokensPurchased(msg.sender, amountToBuy, msg.value);
    }

    function setValueIncome(uint64 _valueIncome) external onlyOwner {
        require(_valueIncome <= valueOfYmmo, "the income cannot be greater than the value of Ymmo");
        valueIncome = _valueIncome;
    }

    function getIncome() external payable nonReentrant {
        uint256 tokenBalance = tokenContract.balanceOf(msg.sender);
        require(tokenBalance > 0, "No YMmo tokens owned");

        uint256 totalSupply = tokenContract.totalSupply();
        uint256 userShare = (tokenBalance * 10 ** 18) / totalSupply;
        uint256 income = (userShare * valueIncome) / (10 ** 18);

        (bool success, ) = msg.sender.call{value: income}("");
        require(success, "Income transfer failed");

        emit IncomeDistributed(msg.sender, income);
    }

    function withdrawETH(address _to, uint256 amount) external payable onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = _to.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {}
}
