const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy YmmoFactory contract
  const ymmoFactory = await hre.ethers.deployContract("YmmoFactory");
  await ymmoFactory.waitForDeployment();
  console.log("YmmoFactory deployed to:", ymmoFactory.target);

  // Optionally, create an Ymmo instance for initial testing
  await ymmoFactory.createYmmo(1000, 1);
  console.log("Ymmo instance created");

  console.log("Deployment completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
