// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./Ymmo.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YmmoFactory Contract
 * @notice This contract is used to create and manage Ymmo contracts.
 * @dev Inherits from Ownable to manage ownership of the contract.
 */
contract YmmoFactory is Ownable {
    Ymmo[] private listOfYmmo;

    /**
     * @notice Event emitted when a new Ymmo contract is deployed.
     * @param contractAddress The address of the newly deployed Ymmo contract.
     */
    event NewContractYmmoDeploy(address contractAddress);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates a new Ymmo contract.
     * @param _valueOfYmmo The initial value of the Ymmo contract.
     */
    function createYmmo(uint128 _valueOfYmmo) external onlyOwner {
        Ymmo ymmo = new Ymmo(_valueOfYmmo, uint64(listOfYmmo.length + 1), 0xE0f0dd2b77d74D9B3298f3adc9F4aeDF1e33b6f0);
        listOfYmmo.push(ymmo);
        emit NewContractYmmoDeploy(address(ymmo));
    }

    /**
     * @notice Returns the list of deployed Ymmo contracts.
     * @return An array of Ymmo contract addresses.
     */
    function getListOfYmmo() external view returns (Ymmo[] memory) {
        return listOfYmmo;
    }
}
