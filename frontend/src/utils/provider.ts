/**
* @title Web3 Provider Utilities
* @notice Core Web3 connection and provider management
* @dev Handles Ethereum provider and signer initialization
* @custom:module-hierarchy Core Web3 Component
*/

import { BrowserProvider, JsonRpcSigner } from 'ethers';

/**
* @notice Creates and returns an Ethereum provider instance
* @dev Validates MetaMask presence and initializes BrowserProvider
* @return Promise<BrowserProvider> Initialized provider instance
* @custom:requires MetaMask extension installed
* @custom:errors
* - MetaMask not installed
* - Provider initialization failure
* @example
* const provider = await getProvider();
* const network = await provider.getNetwork();
*/
export async function getProvider(): Promise<BrowserProvider> {
    // Check if MetaMask exists
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }
    // Create provider from MetaMask
    return new BrowserProvider(window.ethereum);
}

/**
* @notice Gets the current user's signer instance
* @dev Retrieves JsonRpcSigner from provider for transaction signing
* @return Promise<JsonRpcSigner> User's signer instance
* @custom:requires
* - Active provider connection
* - User wallet connected
* @custom:errors
* - Provider not available
* - No wallet connected
* @example
* const signer = await getSigner();
* const address = await signer.getAddress();
*/
export async function getSigner(): Promise<JsonRpcSigner> {
    const provider = await getProvider();
    return provider.getSigner();
}

/**
* @notice Gets the currently connected wallet address
* @dev Requests account access through MetaMask
* @return Promise<string> Connected wallet address
* @custom:requires
* - MetaMask extension
* - User approval for connection
* @custom:errors
* - Provider not available
* - User rejected connection
* - No accounts available
* @example
* const address = await getCurrentAddress();
* console.log('Connected wallet:', address);
*/
export async function getCurrentAddress(): Promise<string> {
    const provider = await getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
}

