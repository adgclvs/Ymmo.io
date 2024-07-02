const hre = require("hardhat");

async function main() {
  const bank = await ethers.getContractFactory("Bank");
  const bankContract = bank.attach("0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6");
  console.log(bankContract.getBalance());

  const ymmoFactory = await ethers.getContractFactory("YmmoFactory");
  const ymmoFactoryContract = ymmoFactory.attach("0x610178dA211FEF7D417bC0e6FeD39F05609AD788");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
