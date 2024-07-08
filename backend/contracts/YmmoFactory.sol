// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YmmoFactory is Ownable {
    Ymmo[] private listOfYmmo;

    event NewContractYmmoDeploy(address contractAddress);

    constructor() Ownable(msg.sender) {}

    function createYmmo(uint128 _valueOfYmmo) external onlyOwner {
        Ymmo ymmo = new Ymmo(_valueOfYmmo, uint64(listOfYmmo.length + 1));
        listOfYmmo.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }

    function getListOfYmmo() external view returns (Ymmo[] memory) {
        return listOfYmmo;
    }
}
