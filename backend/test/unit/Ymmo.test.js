const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ymmo tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Ymmo = await ethers.getContractFactory("Ymmo");

    const ymmo = await Ymmo.deploy(1000000, 1);
    await ymmo.waitForDeployment();

    const tokenAddress = await ymmo.tokenContract();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.attach(tokenAddress);

    return { ymmo, token, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy the contract and set the correct initial values", async function () {
      const { ymmo, token } = await loadFixture(deployContract);

      const valueOfYmmo = await ymmo.valueOfYmmo();
      expect(valueOfYmmo).to.equal(1000000);

      const indexOfYmmo = await ymmo.indexOfYmmo();
      expect(indexOfYmmo).to.equal(1);

      const tokenSupply = await token.totalSupply();
      expect(tokenSupply).to.equal(1000000);
    });
  });

  describe("Buying token", function () {
    it("Should allow buying tokens with ETH", async function () {
      const { ymmo, token, otherAccount } = await loadFixture(deployContract);

      // Assume 1 ETH = 2000 tokens
      const ethAmount = ethers.parseEther("1"); // 1 ETH
      const expectedTokens = 2000; // 1 ETH = 2000 tokens

      await ymmo.connect(otherAccount).buyTokens({ value: ethAmount });

      // Check the token balance of otherAccount
      const tokenBalance = await token.balanceOf(otherAccount.address);
      expect(tokenBalance).to.equal(expectedTokens);

      // Check the ETH balance of the contract
      const contractBalance = await ethers.provider.getBalance(ymmo.target);
      expect(contractBalance).to.equal(ethAmount);
    });

    it("Should not allow buying tokens with 0 ETH", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      await expect(ymmo.connect(otherAccount).buyTokens({ value: 0 })).to.be.revertedWith("You need to send some ETH");
    });
  });

  describe("Set Percentage Income", function () {
    it("Should allow the owner to set the income percentage", async function () {
      const { ymmo } = await loadFixture(deployContract);
      await ymmo.setPercentageIncome(5000); // Set income to 5%

      const valueIncome = await ymmo.valueIncome();
      expect(valueIncome).to.equal(5000);
    });

    it("Should not allow non-owner to set the income percentage", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      await expect(ymmo.connect(otherAccount).setPercentageIncome(5000))
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });

  describe("Withdraw ETH", function () {
    it("Should allow the owner to withdraw ETH", async function () {
      const { ymmo, owner, otherAccount } = await loadFixture(deployContract);

      // Call the buyTokens function and send 1 ETH to the contract
      await ymmo.connect(otherAccount).buyTokens({ value: ethers.parseEther("1") });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      // Withdraw 1 ETH from the contract
      const tx = await ymmo.withdrawETH(owner.address, ethers.parseEther("1"));
      await tx.wait();

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.above(initialBalance);
    });

    it("Should not allow non-owner to withdraw ETH", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      await expect(ymmo.connect(otherAccount).withdrawETH(otherAccount.address, ethers.parseEther("1")))
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });

  describe("Get Income", function () {
    it("Should distribute income correctly based on token holdings", async function () {
      const { ymmo, token, owner, otherAccount } = await loadFixture(deployContract);

      // Set income percentage to 5%
      await ymmo.setPercentageIncome(5000); // Set income to 5%

      // Call the buyTokens function and send 1 ETH to buy tokens (2000 tokens)
      await ymmo.connect(otherAccount).buyTokens({ value: ethers.parseEther("1") });

      // Send 1 ETH to the contract to act as income
      await owner.sendTransaction({
        to: ymmo.target,
        value: ethers.parseEther("1"),
      });

      // Calculate expected income
      const tokenBalance = await token.balanceOf(otherAccount.address);
      const totalSupply = await token.totalSupply();
      const userShare = (tokenBalance * ethers.WeiPerEther) / totalSupply;
      const income = (userShare * 5000n) / ethers.WeiPerEther;

      // Distribute income to token holders
      const tx = await ymmo.connect(otherAccount).getIncome();

      // Verify the event is emitted correctly
      await expect(tx).to.emit(ymmo, "IncomeDistributed").withArgs(otherAccount.address, income);
    });

    it("Should not distribute income if no tokens are owned", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);

      await expect(ymmo.connect(otherAccount).getIncome()).to.be.revertedWith("No YMmo tokens owned");
    });
  });
});
