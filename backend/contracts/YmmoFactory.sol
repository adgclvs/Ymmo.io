// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "./Bank.sol";
import "../contants/index.js";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YmmoFactory is Ownable {
    address private bankAddress;
    address private _usdcContract;
    Ymmo[] public list_of_ymmos;

    event NewContractYmmoDeploy(address contractAddress);

    constructor() Ownable(msg.sender) {
        _usdcContract = USDC_SEPOLIA_ADDRESS;
        bankAddress = address(new Bank(_usdcContract)); //Change _usdcContract with the usdc Contract on the correct chain
    }

    function createYmmo(uint128 _valueOfYmmo, uint128 _indexOfYmmo) external onlyOwner {
        Ymmo ymmo = new Ymmo(_valueOfYmmo, _indexOfYmmo, bankAddress);
        list_of_ymmos.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }
}
