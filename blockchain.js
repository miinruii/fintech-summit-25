import { ethers } from "ethers";

// XRPL EVM Sidechain RPC URL
const XRPL_EVM_RPC = "https://rpc-evm-sidechain.xrpl.org";

// Provider to interact with the EVM Sidechain
const provider = new ethers.providers.JsonRpcProvider(XRPL_EVM_RPC);

// Wallet signer (optional for transactions)
export const createSigner = (privateKey) => {
  return new ethers.Wallet(privateKey, provider);
};

// Get balance of an address
export const getBalance = async (address) => {
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
};