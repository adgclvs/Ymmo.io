require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("hardhat-gas-reporter");
require("solidity-coverage");

require("@nomicfoundation/hardhat-verify");

const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  defaultNetwork: "hardhat",

  networks: {
    // sepolia: {
    //   url: HOLESKY_RPC_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   chainId: 17000,
    //   blockConfirmations: 6,
    // },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
    ],
  },
};
