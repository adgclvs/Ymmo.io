const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YmmoFactory tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();
    const YmmoFactory = await ethers.getContractFactory("YmmoFactory");
    const ymmoFactory = await YmmoFactory.deploy(YmmoFactory);
    return { ymmoFactory, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { ymmoFactory } = await loadFixture(deployContract);
      expect(await ymmoFactory.currentIndex()).to.equal(0);
    });
  });

  describe("Create Ymmo", function () {
    it("Should create a new Ymmo", async function () {
      const { ymmoFactory } = await loadFixture(deployContract);
      await ymmoFactory.createYmmo(100);
      expect(await ymmoFactory.currentIndex()).to.equal(1);
    });

    it("Should return the error : You're not the Owner", async function () {
      const { ymmoFactory, otherAccount } = await loadFixture(deployContract);
      await expect(ymmoFactory.connect(otherAccount).createYmmo(100))
        .to.be.revertedWithCustomError(ymmoFactory, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });
});
