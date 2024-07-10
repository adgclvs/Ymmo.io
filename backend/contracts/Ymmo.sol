// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./DataConsumerV3.sol";
import "./Token.sol";

/**
 * @title Ymmo Contract
 * @notice This contract allows for the creation, purchase, and income distribution of Ymmo tokens.
 * @dev Inherits from Ownable and ReentrancyGuardUpgradeable.
 */
contract Ymmo is Ownable, ReentrancyGuardUpgradeable, DataConsumerV3 {
    uint128 public valueOfYmmo;
    uint64 public indexOfYmmo;
    uint64 public valueIncome;

    IERC20 public tokenContract;

    /**
     * @notice Event emitted when tokens are purchased.
     * @param buyer The address of the buyer.
     * @param amount The amount of tokens purchased.
     * @param ethSpent The amount of ETH spent.
     */
    event TokensPurchased(address buyer, uint256 amount, uint256 ethSpent);

    /**
     * @notice Event emitted when income is distributed.
     * @param _address The address receiving the income.
     * @param _amount The amount of income distributed.
     */
    event IncomeDistributed(address _address, uint256 _amount);

    /**
     * @notice Event emitted when value income is set.
     * @param amount The amount of ETH set as income.
     */
    event ValueIncomeSet(uint256 amount);

    /**
     * @notice Constructor that initializes the contract with a value and index for Ymmo.
     * @param _valueOfYmmo The initial value of the Ymmo contract.
     * @param _indexOfYmmo The index of the Ymmo contract.
     */
    constructor(uint128 _valueOfYmmo, uint64 _indexOfYmmo) Ownable(msg.sender) {
        require(_valueOfYmmo > 0, "Value of Ymmo must be greater than 0");
        valueOfYmmo = _valueOfYmmo;
        indexOfYmmo = _indexOfYmmo;
        string memory name = "YMMO";
        string memory symbol = string(abi.encodePacked("YMMO_", Strings.toString(_indexOfYmmo)));
        tokenContract = IERC20(new Token(_valueOfYmmo, name, symbol));
    }

    /**
     * @notice Sets the value of income that can be distributed by sending ETH.
     */
    function setValueIncome() external payable onlyOwner {
        require(msg.value > 0, "You need to send some ETH");
        require(msg.value <= valueOfYmmo, "the income cannot be greater than the value of Ymmo");

        valueIncome = uint64(msg.value);
        emit ValueIncomeSet(msg.value);
    }

    /**
     * @notice Allows users to buy Ymmo tokens using ETH.
     */
    function buyTokens() external payable {
        require(msg.value > 0, "You need to send some ETH");

        // Get the current price of ETH from Chainlink
        int256 ethPrice = getChainlinkDataFeedLatestAnswer();
        require(ethPrice > 0, "Invalid price feed value");

        // Convert ETH price to USD with 18 decimals
        uint256 ethPriceInUsd = uint256(ethPrice) * 1e8; // Chainlink returns price with 8 decimals

        // Calculate the amount of USD equivalent to the sent ETH
        uint256 usdAmount = (msg.value * ethPriceInUsd) / 1e18;

        // Determine the amount of tokens to buy (assuming 1 token = 1 USD)
        uint256 tokensToBuy = usdAmount;

        require(tokenContract.balanceOf(address(this)) >= tokensToBuy, "Not enough tokens in the reserve");

        // Transfer YMmo tokens from the contract to the buyer
        bool tokenSuccess = tokenContract.transfer(msg.sender, tokensToBuy);
        require(tokenSuccess, "Token transfer failed");

        emit TokensPurchased(msg.sender, tokensToBuy, msg.value);
    }

    /**
     * @notice Allows users to claim their share of the income.
     */
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

    /**
     * @notice Allows the owner to withdraw ETH from the contract.
     * @param _to The address to send the ETH to.
     * @param amount The amount of ETH to withdraw.
     */
    function withdrawETH(address _to, uint256 amount) external payable onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = _to.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice Fallback function to receive ETH.
     */
    receive() external payable {}
}
