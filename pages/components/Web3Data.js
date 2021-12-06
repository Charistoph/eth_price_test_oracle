import React, { useState, useEffect, useCallback } from "react";

import styles from "../../styles/Home.module.css";

import EthPriceOracle from "./EthPriceOracle.js";

export default function Web3Data(props) {
  const { web3Context } = props;
  const { networkId, networkName, accounts, providerName, lib } = web3Context;
  const [balance, setBalance] = useState(0);
  const getBalance = useCallback(async () => {
    let balance =
      accounts && accounts.length > 0
        ? lib.utils.fromWei(await lib.eth.getBalance(accounts[0]), "ether")
        : "Unknown";
    setBalance(balance);
  }, [accounts, lib.eth, lib.utils]);

  // https://reactjs.org/docs/hooks-effect.html
  // By using this Hook, you tell React that your component needs to do something after render.
  // React will remember the function you passed (we’ll refer to it as our “effect”),
  // and call it later after performing the DOM updates.
  useEffect(() => {
    getBalance();
  }, [accounts, getBalance, networkId]);

  const requestAuth = async (web3Context) => {
    try {
      await web3Context.requestAuth();
    } catch (e) {
      console.error(e);
    }
  };
  const requestAccess = useCallback(
    (web3Context) => requestAuth(web3Context),
    []
  );
  console.log("ownerAddress", accounts[0]);
  console.log("web3js", web3Context);
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to whatever this is</h1>

        <div>
          <h3> {props.title} </h3>
          <div>
            Network:{" "}
            {networkId ? `${networkId} – ${networkName}` : "No connection"}
          </div>
          <div>
            Your address:{" "}
            {accounts && accounts.length ? accounts[0] : "Unknown"}
          </div>
          <div>Your ETH balance: {balance}</div>
          <div>Provider: {providerName}</div>
          {accounts && accounts.length ? (
            <div>Accounts & Signing Status: Access Granted</div>
          ) : !!networkId && providerName !== "infura" ? (
            <div>
              <button onClick={requestAccess}>Request Access</button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
        {accounts && accounts.length ? (
          <EthPriceOracle vars={{ accounts, web3Context }} />
        ) : (
          <h2>Couldn't load EthPriceOracle</h2>
        )}
      </main>
    </div>
  );
}
