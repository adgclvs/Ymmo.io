const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Ymmo = await ethers.getContractFactory("Ymmo");

  const ymmo = await Ymmo.deploy(1000000, 1);
  await ymmo.waitForDeployment();
  console.log("Ymmo deployed to:", ymmo.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
