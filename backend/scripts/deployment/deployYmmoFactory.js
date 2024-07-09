const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const YmmoFactory = await ethers.getContractFactory("YmmoFactory");

  const ymmoFactory = await YmmoFactory.deploy();
  await ymmoFactory.waitForDeployment();
  console.log("YmmoFactory deployed to:", ymmoFactory.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
