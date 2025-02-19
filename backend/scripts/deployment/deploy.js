const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Ymmo = await hre.ethers.getContractFactory("Ymmo");

  const ymmo = await Ymmo.deploy(1000000, 1, deployer.address);
  await ymmo.waitForDeployment();
  console.log("Ymmo deployed to:", ymmo.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
