// Initialize HDWalletProvider
const HDWalletProvider = require("@truffle/hdwallet-provider");

// Set your own mnemonic here
// const fs = require("fs");
// const mnemonic = fs.readFileSync("../.rinkeby_secret").toString().trim();

// New: read key & mnemonic
// https://docs.openzeppelin.com/learn/connecting-to-public-test-networks
const { alchemyApiKey, mnemonic } = require("../.mm_secret.json");

// cd caller && npx truffle migrate --network rinkeby --reset -all && cd ..

// Module exports to make this configuration available to Truffle itself
module.exports = {
  // Object with configuration for each network
  networks: {
    // Configuration for mainnet
    mainnet: {
      provider: function () {
        // Setting the provider with the Infura Mainnet address and Token
        return new HDWalletProvider(
          mnemonic,
          "https://mainnet.infura.io/v3/YOUR_TOKEN" // intentional
        );
      },
      network_id: "1",
    },
    // Configuration for rinkeby network
    rinkeby: {
      // Special function to setup the provider
      provider: function () {
        // Setting the provider with the Infura Rinkeby address and Token
        return new HDWalletProvider(
          mnemonic,
          // `https://rinkeby.infura.io/v3/${alchemyApiKey}`
          // deploying with wss instead https://github.com/trufflesuite/truffle/issues/3357
          `wss://rinkeby.infura.io/ws/v3/${alchemyApiKey}`
        );
      },
      // Network id is 4 for Rinkeby
      network_id: 4,
    },
  },

  // Configure your compilers
  // truffle 0-5-16 issues with complier
  // https://stackoverflow.com/questions/68070253/error-truffle-is-currently-using-solc-0-5-16-but-one-or-more-of-your-contracts
  compilers: {
    solc: {
      version: "0.8.10", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
    },
  },
};
