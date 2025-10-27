import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./abi";

export const getWeb3 = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return web3;
  }
  throw new Error("Please install MetaMask");
};

export const getContract = async (useWebSocket = false) => {
  const web3 = await getWeb3();
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  const accounts = await web3.eth.getAccounts();
  
  // For WebSocket connections (real-time events), we'll use the same HTTP provider
  // Most modern dApps use HTTP providers with polling instead of WebSocket
  // since MetaMask doesn't support WebSocket connections directly
  
  return { web3, contract, accounts };
};
