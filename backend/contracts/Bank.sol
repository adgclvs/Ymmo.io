// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bank is Ownable {
    IERC20 public usdcContract;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed owner, uint256 amount);

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcContract = IERC20(_usdcAddress);
    }

    function deposit(address _account, uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");

        bool success = usdcContract.transferFrom(_account, address(this), _amount);
        require(success, "USDC transfer failed");

        emit Deposit(msg.sender, _amount);
    }

    function transferUSDC(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 usdcBalance = usdcContract.balanceOf(address(this));
        require(usdcBalance >= amount, "Insufficient USDC balance");

        usdcContract.transfer(to, amount);
    }
}
