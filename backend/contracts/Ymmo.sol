// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Token.sol";

contract Ymmo is Ownable {
    uint128 private valueOfYmmo;
    uint128 private indexOfYmmo;
    Token private tokenContract;

    constructor(uint128 _valueOfYmmo, uint128 _indexOfYmmo) Ownable(msg.sender) {
        valueOfYmmo = _valueOfYmmo;
        indexOfYmmo = _indexOfYmmo;
        string memory name = "YMMO";
        string memory symbol = string(abi.encodePacked("YMMO_", Strings.toString(_indexOfYmmo)));
        tokenContract = new Token(_valueOfYmmo, name, symbol);
    }

    function mintToken(uint256 _amountOfToken) internal onlyOwner {
        tokenContract.mint(_amountOfToken);
    }
}
