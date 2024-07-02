const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("YmmoFactory tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();
    const YmmoFactory = await ethers.getContractFactory("YmmoFactory");
    const ymmoFactory = await YmmoFactory.deploy(YmmoFactory);
    return { ymmoFactory, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the smart contract", async function () {
      const { ymmoFactory } = await loadFixture(deployContract);
      const listOfYmmo = await ymmoFactory.getListOfYmmo();
      expect(listOfYmmo.length).to.equal(0);
    });
  });

  describe("Create Ymmo", function () {
    it("Should create a new Ymmo", async function () {
      const { ymmoFactory } = await loadFixture(deployContract);
      await ymmoFactory.createYmmo(100, 1);
      const listOfYmmo = await ymmoFactory.getListOfYmmo();
      expect(listOfYmmo.length).to.equal(1);
    });

    it("Should return the error : You're not the Owner", async function () {
      const { ymmoFactory, otherAccount } = await loadFixture(deployContract);
      await expect(ymmoFactory.connect(otherAccount).createYmmo(100, 1))
        .to.be.revertedWithCustomError(ymmoFactory, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });

    it("Should return the list of Ymmo", async function () {
      const { ymmoFactory } = await loadFixture(deployContract);
      await ymmoFactory.createYmmo(100, 1);
      await ymmoFactory.createYmmo(10000, 2);
      await ymmoFactory.createYmmo(10000000, 3);
      const list = await ymmoFactory.getListOfYmmo();
      expect(await list.length).to.equal(3);
    });
  });
});
