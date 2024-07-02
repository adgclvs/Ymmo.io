const hre = require("hardhat");
//const { USDC } = require("../../contants/index");

async function main() {
  const ymmoFactory = await hre.ethers.deployContract("YmmoFactory");
  await ymmoFactory.waitForDeployment();
  console.log("YmmoFactory deployed to:", ymmoFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
