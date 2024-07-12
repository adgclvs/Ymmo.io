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
    uint256 public currentIndex;
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
    function createYmmo(uint256 _valueOfYmmo) external onlyOwner {
        currentIndex++;
        Ymmo ymmo = new Ymmo(uint128(_valueOfYmmo), uint64(currentIndex), msg.sender);
        emit NewContractYmmoDeploy(address(ymmo));
    }
}
