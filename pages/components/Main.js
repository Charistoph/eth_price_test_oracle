import { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";

import {
  connectWallet,
  getCurrentWalletConnected,
  getBalance,
  NetworkInfo,
} from "./WalletOps.js";
import { EthPriceOracle } from "./EthPriceOracle.js";
import { ConnectClient, GetEthPrice } from "./Client.js";

const { infuraProjectId, alchemyProjectId } = require("../.providers.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const web3 = createAlchemyWeb3(
  `wss://eth-rinkeby.alchemyapi.io/v2/${alchemyProjectId}`
);

export default function Main(props) {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [buttonStatus, setButtonStatus] = useState("Connect Metamask");
  const [balance, setBalance] = useState(0);
  const [networkInfo, setNetworkInfo] = useState("Unknown");
  const [programRunning, setProgramRunning] = useState("None");
  const [priceButtonStatus, setPriceButtonStatus] = useState("Get ETH Price");
  const [ethPrice, setEthPrice] = useState(0);

  async function setStates(address, status, origin) {
    console.log(`${origin}: address ${address}`);
    console.log(`${origin}: status ${status}`);
    setWallet(address);
    setStatus(status);
    if (address.length > 0) {
      setButtonStatus("Metamask Connected");
    }

    const balance = await getBalance(web3, address);
    setBalance(balance);

    const { networkId, networkName, providerName } = await NetworkInfo(web3);
    setNetworkInfo(
      <div>
        <div>networkId: {networkId}</div>
        <div>networkName: {networkName}</div>
        <div>providerName: {providerName}</div>
      </div>
    );

    // await EthPriceOracle(web3, address);
    // setProgramRunning("EthPriceOracle");

    const prices = await ConnectClient(web3, address, setEthPrice);
    console.log("RECEIVED: prices", prices);
    setEthPrice(prices);
    setProgramRunning("Client");
  }

  const onConnectPressed = async () => {
    console.log("onConnectPressed");
    if (walletAddress.length == 0) {
      setButtonStatus("Connecting...");
      const { address, status } = await connectWallet();
      setStates(address, status, "onConnectPressed");
    }
  };

  const onGetPricePressed = async () => {
    console.log("onGetPricePressed");
    setPriceButtonStatus("Retrieving ETH Price");
    await GetEthPrice(walletAddress, setEthPrice);
  };

  useEffect(() => {
    (async () => {
      const { address, status } = await getCurrentWalletConnected();
      setStates(address, status, "async");
    })();
  }, []);

  function CustomComponent() {
    return programRunning == "Client" ? (
      <div>
        <div>
          <h2>What's the current ETH/USD Price?</h2>
        </div>
        <div>
          <button
            id="Get ETH Price"
            onClick={() => {
              console.log("BUTTON CLICK: Get ETH Price");
              onGetPricePressed();
            }}
          >
            {priceButtonStatus}
          </button>
          <div>{ethPrice > 0 ? `ETH/USD Price: ${ethPrice}` : ""}</div>
        </div>
      </div>
    ) : (
      <div />
    );
  }

  // <h1 className={styles.title}>Welcome Fren, To The Moon!</h1>
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Program Running: {programRunning}</h1>

        <h2>Wallet</h2>
        <div>
          <button
            id="Connect Metamask"
            onClick={() => {
              console.log("BUTTON CLICK: Connect Metamask");
              onConnectPressed();
            }}
            disabled={
              buttonStatus === "Connecting Metamask..." ||
              buttonStatus === "Metamask Connected"
            }
          >
            {buttonStatus}
          </button>
        </div>
        <div>
          <div>Status: {status}</div>
          <div>Balance: {balance}</div>
        </div>
        <h2>Network Info</h2>
        <div>{networkInfo}</div>
        <CustomComponent />
      </main>
    </div>
  );
}
