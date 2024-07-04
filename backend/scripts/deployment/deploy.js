const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockUSDC contract
  const usdc = await hre.ethers.deployContract("MockUSDC");
  await usdc.waitForDeployment();
  console.log("usdc deployed to:", usdc.target);

  // Deploy Bank contract
  const bank = await hre.ethers.deployContract("Bank", [usdc.target]);
  await bank.waitForDeployment();
  console.log("Bank deployed to:", bank.target);

  // Deploy YmmoFactory contract
  const ymmoFactory = await hre.ethers.deployContract("YmmoFactory");
  await ymmoFactory.waitForDeployment();
  console.log("YmmoFactory deployed to:", ymmoFactory.target);

  // Set the USDC address in the factory contract
  await ymmoFactory.setUSDCContract(usdc.target);
  await ymmoFactory.setBankAddress(bank.target);

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
