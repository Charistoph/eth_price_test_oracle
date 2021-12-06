const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000;
const CallerJSON = require("../../solidity/caller/build/contracts/CallerContract.json");
const OracleJSON = require("../../solidity/oracle/build/contracts/EthPriceOracle.json");

let callerContract;
let prices;

async function getCallerContract(web3) {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    CallerJSON.abi,
    CallerJSON.networks[networkId].address
  );
}

async function filterEvents(web3, callerContract, setEthPrice) {
  let prices = [];
  callerContract.events.PriceUpdatedEvent(
    { filter: {} },
    async (err, event) => {
      if (err) console.error("Error on event", err);
      console.log(
        "* New PriceUpdated event. ethPrice: " + event.returnValues.ethPrice
      );

      setEthPrice(web3.utils.fromWei(event.returnValues.ethPrice));
    }
  );
  callerContract.events.ReceivedNewRequestIdEvent(
    { filter: {} },
    async (err, event) => {
      if (err) console.error("Error on event", err);
    }
  );
  return prices;
}

async function init(web3, setEthPrice) {
  callerContract = await getCallerContract(web3);
  prices = await filterEvents(web3, callerContract, setEthPrice);
  //   return { callerContract: callerContract, prices: prices };
}

export async function ConnectClient(web3, ownerAddress, setEthPrice) {
  (async () => {
    await init(web3, setEthPrice);
    console.log("callerContract", callerContract);
    console.log("callerContract._address", callerContract._address);
    process.on("SIGINT", () => {
      console.log("Calling client.disconnect()");
      client.disconnect();
      process.exit();
    });
    const networkId = await web3.eth.net.getId();
    const oracleAddress = OracleJSON.networks[networkId].address;
    await callerContract.methods
      .setOracleInstanceAddress(oracleAddress)
      .send({ from: ownerAddress });
    /*
    setInterval(async () => {
      await callerContract.methods
        .updateEthPrice()
        .send({ from: ownerAddress });
    }, SLEEP_INTERVAL);
     */
    return prices;
  })();
}

export async function GetEthPrice(ownerAddress) {
  console.log("GetEthPrice: ownerAddress", ownerAddress);
  await callerContract.methods.updateEthPrice().send({ from: ownerAddress });
}
