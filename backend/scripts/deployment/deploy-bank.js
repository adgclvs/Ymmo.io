const hre = require("hardhat");
//const { USDC } = require("../../contants/index");

async function main() {
  const USDCAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

  const bank = await hre.ethers.deployContract("Bank", [USDCAddress]);
  await bank.waitForDeployment();
  console.log("Bank deployed to:", bank.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
