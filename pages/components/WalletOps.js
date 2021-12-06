export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletString =
        "Connected: " +
        String(addressArray[0]).substring(0, 6) +
        "..." +
        String(addressArray[0]).substring(38);
      const obj = {
        status: walletString,
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>You must install a wallet like Metamask for your browser.</p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        const walletString =
          "Connected: " +
          String(addressArray[0]).substring(0, 6) +
          "..." +
          String(addressArray[0]).substring(38);
        return {
          address: addressArray[0],
          status: walletString,
        };
      } else {
        return {
          address: "",
          status: "Connect your wallet to get started.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>You must install a wallet like Metamask for your browser.</p>
        </span>
      ),
    };
  }
};

export const getBalance = async (web3, address) => {
  try {
    let balance =
      address && address.length > 0
        ? web3.utils.fromWei(await web3.eth.getBalance(address), "ether")
        : "Unknown";
    return balance;
  } catch (err) {
    console.log("ERROR: getBalance", err);
    return "unable to retrieve balance";
  }
};

export const NetworkInfo = async (web3) => {
  return {
    networkId: await web3.eth.net.getId(),
    networkName: await web3.eth.net.getNetworkType(),
    providerName: web3.currentProvider.constructor.name,
  };
};
