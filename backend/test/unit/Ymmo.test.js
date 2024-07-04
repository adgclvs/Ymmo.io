const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ymmo tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Ymmo = await ethers.getContractFactory("YmmoFactory");
    const ymmo = await Ymmo.deploy(1000, 1, null);
    return { ymmo, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { ymmo } = await loadFixture(deployContract);
    });
  });
});
