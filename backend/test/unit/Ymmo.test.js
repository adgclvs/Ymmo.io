const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ymmo tests", function () {
  async function deployContract() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Ymmo = await ethers.getContractFactory("Ymmo");

    const ymmo = await Ymmo.deploy(1000000, 1, owner);
    await ymmo.waitForDeployment();

    const tokenAddress = await ymmo.tokenContract();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.attach(tokenAddress);

    return { ymmo, token, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should revert if value of ymmo equal 0", async function () {
      const [owner] = await ethers.getSigners();
      const Ymmo = await ethers.getContractFactory("Ymmo");
      await expect(Ymmo.deploy(0, 1, owner)).to.be.revertedWith("Value of Ymmo must be greater than 0");
    });

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

  describe("AvailableIncome", function () {
    it("Should change the boolean of availableIcome", async function () {
      const { ymmo } = await loadFixture(deployContract);
      await ymmo.changeAvailableIncome();
      expect(await ymmo.availableIncome()).to.equal(true);
    });

    it("Should revert if you're not the owner", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      await expect(ymmo.connect(otherAccount).changeAvailableIncome())
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });

  describe("Buying token", function () {
    it("Should allow buying tokens with ETH", async function () {
      const { ymmo, token, otherAccount } = await loadFixture(deployContract);

      // Assume 1 ETH = 3000 tokens
      const ethAmount = ethers.parseEther("1"); // 1 ETH
      const expectedTokens = 3000; // 1 ETH = 3000 tokens

      await ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethAmount });

      // Check the token balance of otherAccount
      const tokenBalance = await token.balanceOf(otherAccount.address);
      expect(tokenBalance).to.equal(expectedTokens);

      // Check the ETH balance of the contract
      const contractBalance = await ethers.provider.getBalance(ymmo.target);
      expect(contractBalance).to.equal(ethAmount);
    });

    // it("Should revert if not enough ETH", async function () {
    //   const { ymmo, token, owner, otherAccount } = await loadFixture(deployContract);

    //   const ethAmount = ethers.parseEther("1"); // 1 ETH

    //   // Vide le compte
    //   const otherAccountBalance = await ethers.provider.getBalance(otherAccount.address);
    //   const transferAmount = otherAccountBalance - ethers.parseEther("0.1");
    //   await otherAccount.sendTransaction({
    //     to: owner.address,
    //     value: transferAmount,
    //   });

    //   await expect(ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethAmount })).to.be.revertedWith(
    //     "Not enough tokens in the reserve",
    //   );

    //   const tokenBalance = await token.balanceOf(otherAccount.address);
    //   expect(tokenBalance).to.equal(0);

    //   const contractBalance = await ethers.provider.getBalance(ymmo.target);
    //   expect(contractBalance).to.equal(0);
    // });

    it("Should not allow buying tokens with 0 ETH", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      await expect(ymmo.connect(otherAccount).buyTokens(ymmo, { value: 0 })).to.be.revertedWith(
        "You need to send some ETH",
      );
    });
  });

  describe("Set Percentage Income", function () {
    it("Should allow the owner to set the income percentage", async function () {
      const { ymmo } = await loadFixture(deployContract);
      const ethValue = ethers.parseEther("1");

      await ymmo.setValueIncome(ymmo.target, { value: ethValue });

      const valueIncome = await ymmo.valueIncome();
      expect(valueIncome).to.equal(1);
    });

    it("Should not allow non-owner to set the income percentage", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);
      const ethValue = ethers.parseEther("1");

      await expect(ymmo.connect(otherAccount).setValueIncome(ymmo.target, { value: ethValue }))
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });

    it("Should revert if no ETH is sent", async function () {
      const { ymmo, owner } = await loadFixture(deployContract);

      await expect(ymmo.connect(owner).setValueIncome(ymmo.target, { value: 0 })).to.be.revertedWith(
        "You need to send some ETH",
      );
    });

    // it("Should revert if the income is greater than the value of Ymmo", async function () {
    //   const { ymmo, owner } = await loadFixture(deployContract);
    //   const ethValue = ethers.parseEther("1000");

    //   await expect(ymmo.connect(owner).setValueIncome(ymmo.target, { value: ethValue })).to.be.revertedWith(
    //     "the income cannot be greater than the value of Ymmo",
    //   );
    // });

    it("Should revert if availableIncome is true", async function () {
      const { ymmo, owner } = await loadFixture(deployContract);
      const ethValue = ethers.parseEther("1");

      // Simulate availableIncome being true
      await ymmo.changeAvailableIncome(); // You need to implement this in your contract or simulate this state

      await expect(ymmo.connect(owner).setValueIncome(ymmo.target, { value: ethValue })).to.be.revertedWith(
        "You can't deposit value Income",
      );
    });
  });

  describe("Withdraw ETH", function () {
    it("Should allow the owner to withdraw ETH", async function () {
      const { ymmo, owner, otherAccount } = await loadFixture(deployContract);

      // Simuler l'achat de tokens et envoyer 1 ETH au contrat
      await ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethers.parseEther("1") });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      // Retirer 1 ETH du contrat
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

    it("Should revert if contract balance is insufficient", async function () {
      const { ymmo, owner } = await loadFixture(deployContract);

      // Essayer de retirer plus que le solde du contrat
      await expect(ymmo.withdrawETH(owner.address, ethers.parseEther("1"))).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Get Income", function () {
    it("Should distribute income correctly based on token holdings", async function () {
      const { ymmo, token, otherAccount, owner } = await loadFixture(deployContract);

      // Définir la valeur de l'income
      await ymmo.connect(owner).setValueIncome(owner.address, { value: ethers.parseEther("1") });

      // Acheter des tokens pour otherAccount (3000 tokens)
      await ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethers.parseEther("1") });

      // Rendre l'income disponible
      await ymmo.connect(owner).changeAvailableIncome();

      // Calculer le revenu attendu
      const tokenBalance = await token.balanceOf(otherAccount.address);
      const totalSupply = await token.totalSupply();
      const userShare = (tokenBalance * ethers.WeiPerEther) / totalSupply;
      const income = (userShare * ethers.parseEther("1")) / ethers.WeiPerEther;

      // Distribuer l'income aux détenteurs de tokens
      const tx = await ymmo.connect(otherAccount).getIncome();

      // Vérifier que l'événement est émis correctement
      await expect(tx).to.emit(ymmo, "IncomeDistributed").withArgs(otherAccount.address, income);
    });

    it("Should not distribute income if no tokens are owned", async function () {
      const { ymmo, otherAccount, owner } = await loadFixture(deployContract);

      // Rendre l'income disponible
      await ymmo.connect(owner).changeAvailableIncome();

      await expect(ymmo.connect(otherAccount).getIncome()).to.be.revertedWith("No YMmo tokens owned");
    });

    it("Should revert if income is not available yet", async function () {
      const { ymmo, otherAccount, owner } = await loadFixture(deployContract);

      // Acheter des tokens pour otherAccount (3000 tokens)
      await ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethers.parseEther("1") });

      // Essayer de récupérer l'income sans le rendre disponible
      await expect(ymmo.connect(otherAccount).getIncome()).to.be.revertedWith("Income not available yet");
    });

    it("Should revert if income is already retrieved", async function () {
      const { ymmo, token, otherAccount, owner } = await loadFixture(deployContract);

      // Définir la valeur de l'income
      await ymmo.connect(owner).setValueIncome(owner.address, { value: ethers.parseEther("1") });

      // Acheter des tokens pour otherAccount (3000 tokens)
      await ymmo.connect(otherAccount).buyTokens(ymmo.target, { value: ethers.parseEther("1") });

      // Rendre l'income disponible
      await ymmo.connect(owner).changeAvailableIncome();

      // Récupérer l'income pour la première fois
      await ymmo.connect(otherAccount).getIncome();

      // Essayer de récupérer l'income une deuxième fois sans incrémenter retrieveCounter
      await expect(ymmo.connect(otherAccount).getIncome()).to.be.revertedWith("Income already retrieved");
    });

    it("Should increment retrieveCounter", async function () {
      const { ymmo, owner } = await loadFixture(deployContract);
      const initialCounter = await ymmo.retrieveCounter();

      // Réinitialiser l'état de récupération
      await ymmo.connect(owner).resetRetrieveState();

      const newCounter = await ymmo.retrieveCounter();

      expect(newCounter).to.equal(initialCounter + 1n);
    });

    it("Should not increment retrieveCounter if you're not the owner", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);

      await expect(ymmo.connect(otherAccount).resetRetrieveState())
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });

    it("Should not change availableIncome by non-owner and revert", async function () {
      const { ymmo, otherAccount } = await loadFixture(deployContract);

      await expect(ymmo.connect(otherAccount).changeAvailableIncome())
        .to.be.revertedWithCustomError(ymmo, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });
});
