// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Ymmo is Ownable {
    constructor() Ownable(msg.sender) {}
}
