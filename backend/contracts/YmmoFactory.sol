// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "../contants/index.js";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YmmoFactory is Ownable {
    Ymmo[] private listOfYmmo;

    event NewContractYmmoDeploy(address contractAddress);
    event USDCContractUpdated(address newUSDCContract);
    event BankAddressUpdated(address newBankAddress);

    constructor() Ownable(msg.sender) {}

    function createYmmo(uint128 _valueOfYmmo, uint64 _indexOfYmmo) external onlyOwner {
        Ymmo ymmo = new Ymmo(_valueOfYmmo, _indexOfYmmo);
        listOfYmmo.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }

    function getListOfYmmo() external view returns (Ymmo[] memory) {
        return listOfYmmo;
    }
}
