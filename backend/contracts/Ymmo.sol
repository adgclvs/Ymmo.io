// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";

contract Ymmo is Ownable {
    uint128 private valueOfYmmo;
    uint128 private indexOfYmmo;
    Token private tokenContract;
    IERC20 private usdcContract;

    mapping(address => uint256) balances;

    constructor(uint128 _valueOfYmmo, uint128 _indexOfYmmo) Ownable(msg.sender) {
        valueOfYmmo = _valueOfYmmo;
        indexOfYmmo = _indexOfYmmo;
        string memory name = "YMMO";
        string memory symbol = string(abi.encodePacked("YMMO_", Strings.toString(_indexOfYmmo)));
        tokenContract = new Token(_valueOfYmmo, name, symbol);
    }

    function buyTokens(uint256 _amount) external {
        bool success = tokenContract.transfer(msg.sender, _amount);
        require(success, "transfere echoue");
    }
}
