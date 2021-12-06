const axios = require("axios");
const BN = require("bn.js");

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000; // 2000
const CHUNK_SIZE = process.env.CHUNK_SIZE || 3;
const MAX_RETRIES = process.env.MAX_RETRIES || 5;
const OracleJSON = require("../../solidity/oracle/build/contracts/EthPriceOracle.json");
var pendingRequests = [];

async function getOracleContract(web3) {
  /* Loads oracle contract based on abi & address based on specified networkId */
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    OracleJSON.abi,
    OracleJSON.networks[networkId].address
  );
}

async function retrieveLatestEthPrice() {
  /* Retrieves latest ETH price */
  const resp = await axios({
    url: "https://api.binance.com/api/v3/ticker/price",
    params: {
      symbol: "ETHUSDT",
    },
    method: "get",
  });
  console.log("Called retrieveLatestEthPrice()", resp.data.price);
  return resp.data.price;
}

async function filterEvents(oracleContract, web3) {
  console.log("filterEvents", oracleContract.events);
  oracleContract.events.GetLatestEthPriceEvent(async (err, event) => {
    if (err) {
      console.error("Error on event", err);
      return;
    }
    console.log("GetLatestEthPriceEvent event:", event);
    await addRequestToQueue(event);
  });

  oracleContract.events.SetLatestEthPriceEvent(async (err, event) => {
    if (err) console.error("Error on event", err);
    // Do something
  });
}

async function addRequestToQueue(event) {
  const callerAddress = event.returnValues.callerAddress;
  const id = event.returnValues.id;
  console.log("addRequestToQueue: callerAddress:", callerAddress);
  console.log("addRequestToQueue: id:", id);
  pendingRequests.push({ callerAddress, id });
}

async function processQueue(oracleContract, ownerAddress) {
  /* checks if there are any requests to process, processes pending requests */
  console.log("triggered processQueue");
  let processedRequests = 0;
  while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
    const req = pendingRequests.shift();
    await processRequest(
      oracleContract,
      ownerAddress,
      req.id,
      req.callerAddress
    );
    processedRequests++;
  }
}

async function processRequest(oracleContract, ownerAddress, id, callerAddress) {
  /* Tries to process request MAX_RETRIES times. Calls retrieve eth price & sets price */
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const ethPrice = await retrieveLatestEthPrice();
      await setLatestEthPrice(
        oracleContract,
        callerAddress,
        ownerAddress,
        ethPrice,
        id
      );
      return;
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        await setLatestEthPrice(
          oracleContract,
          callerAddress,
          ownerAddress,
          "0",
          id
        );
        return;
      }
      retries++;
    }
  }
}

async function setLatestEthPrice(
  oracleContract,
  callerAddress,
  ownerAddress,
  ethPrice,
  id
) {
  /* Sets latest eth prices by calling the "setLatestEthPrice" method of the oracle contract */
  ethPrice = ethPrice.replace(".", "");
  const multiplier = new BN(10 ** 10, 10);
  const ethPriceInt = new BN(parseInt(ethPrice), 10).mul(multiplier);
  const idInt = new BN(parseInt(id));
  try {
    await oracleContract.methods
      .setLatestEthPrice(
        ethPriceInt.toString(),
        callerAddress,
        idInt.toString()
      )
      .send({ from: ownerAddress });
  } catch (error) {
    console.log("Error encountered while calling setLatestEthPrice.");
    // Do some error handling
  }
  console.log("setLatestEthPrice: price: ", ethPriceInt.toString());
}

async function init(web3) {
  const oracleContract = await getOracleContract(web3);
  console.log("oracleContract", oracleContract);
  console.log("oracleContract_address", oracleContract._address);
  filterEvents(oracleContract, web3);
  return oracleContract;
}

export async function EthPriceOracle(web3, ownerAddress) {
  (async () => {
    const oracleContract = await init(web3);
    // // TEST
    // const ethPrice = await retrieveLatestEthPrice();
    // setLatestEthPrice(oracleContract, ownerAddress, ownerAddress, ethPrice, 0);

    process.on("SIGINT", () => {
      console.log("Calling client.disconnect()");
      client.disconnect();
      process.exit();
    });
    await processQueue(oracleContract, ownerAddress);
    /*
    setInterval(async () => {
      await processQueue(oracleContract, ownerAddress);
    }, SLEEP_INTERVAL);
    */
  })();
}
