const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YmmoFactory tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy(Bank);
    return { bank, owner, otherAccount };
  }
});
