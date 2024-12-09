// src/utils/provider.ts
// This file handles all basic Web3 connection functionality

import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Get provider (connection to blockchain)
export async function getProvider(): Promise<BrowserProvider> {
    // Check if MetaMask exists
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }
    // Create provider from MetaMask
    return new BrowserProvider(window.ethereum);
}

// Get signer (user's wallet)
export async function getSigner(): Promise<JsonRpcSigner> {
    const provider = await getProvider();
    return provider.getSigner();
}

// Get current wallet address
export async function getCurrentAddress(): Promise<string> {
    const provider = await getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
}

