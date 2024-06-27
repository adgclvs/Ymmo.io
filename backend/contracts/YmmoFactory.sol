// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YmmoFactory is Ownable {
    Ymmo ymmo;

    Ymmo[] public list_of_ymmos;

    event NewContractYmmoDeploy(address contractAddress);

    constructor() Ownable(msg.sender) {}

    function createYmmo(uint128 _valueOfYmmo, uint128 _indexOfYmmo) external onlyOwner {
        ymmo = new Ymmo(_valueOfYmmo, _indexOfYmmo);
        list_of_ymmos.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }
}
