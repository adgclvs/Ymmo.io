const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Ymmo = await ethers.getContractFactory("Ymmo");
  const priceFeedAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Chainlink ETH/USD on Mainnet

  const ymmo = await Ymmo.deploy(1000000, 1, priceFeedAddress);
  await ymmo.deployed();

  console.log("Ymmo deployed to:", ymmo.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
