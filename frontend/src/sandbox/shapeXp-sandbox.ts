/**
* @title ShapeXp Sandbox API
* @notice Developer interface for ShapeXp integration and data access
* @dev Provides global window.ShapeXpAPI object with core functionality
* @custom:module-hierarchy Integration API Component
*/

import { ShapeXpHelpers } from '../utils/shapexp-helpers';
import { getCurrentAddress } from '../utils/provider';
import { NFTMetadata } from '../features/nft/nft-fetching';
import { InventoryData } from '../features/nft/inventory';
import { ExperienceAmount } from '../contracts/abis';
import { ContractTransactionResponse } from 'ethers';

/**
* @title ShapeXp Sandbox Interface
* @notice Core class exposing ShapeXp functionality to external applications
* @dev Implements window.ShapeXpAPI interface for developer access
* @custom:interface Global ShapeXpAPI object
*/
export class ShapeXpSandbox {
    constructor() {
        /**
         * @notice Gets current account's ShapeXp amount
         * @dev Retrieves formatted experience from AppState
         * @return Promise<string> Formatted ShapeXp amount
         * @custom:requires Connected wallet
         * @custom:example
         * const xp = await ShapeXpAPI.getShapeXp();
         * console.log('Current ShapeXp:', xp);
         */
        window.ShapeXpAPI = {
            // Get current ShapeXp amount
            getShapeXp: async () => {
                const appState = (window as any).appState;
                return appState.getFormattedExperience();
            },

            /**
             * Mint a new ShapeXp NFT
             */
            mintShapeXp: async () => {
                try {
                    const result = await ShapeXpHelpers.mintShapeXp();
                    if (result.success) {
                        return {
                            success: true as const,
                            ...(result.tx && { tx: result.tx })
                        };
                    } else {
                        return {
                            success: false as const,
                            error: result.error || 'Failed to mint ShapeXp NFT'
                        };
                    }
                } catch (error: any) {
                    return {
                        success: false as const,
                        error: error.message || 'Failed to mint ShapeXp NFT'
                    };
                }
            },

            /**
             * Add global experience points
             * @param type - Experience amount type ("LOW", "MID", "HIGH")
             * @returns Promise with transaction result
             * @example
             * const result = await ShapeXpAPI.addGlobalExperience("LOW");
             * if (result.success) {
             *   console.log('Experience added:', result.transactionHash);
             * }
             */
            addGlobalExperience: async (type: keyof typeof ExperienceAmount) => {
                try {
                    const expType = ExperienceAmount[type];
                    const result = await ShapeXpHelpers.addGlobalExperience(expType);
                    if (result.success) {
                        return {
                            success: true as const,
                            ...(result.transactionHash && { transactionHash: result.transactionHash })
                        };
                    } else {
                        return {
                            success: false as const,
                            error: result.error || 'Failed to add global experience'
                        };
                    }
                } catch (error: any) {
                    return {
                        success: false as const,
                        error: error.message || 'Failed to add global experience'
                    };
                }
            },

            /**
             * Remove NFT from ShapeXp inventory
             */
            removeNFTFromInventory: async (contractAddress: string, tokenId: string) => {
                try {
                    const result = await ShapeXpHelpers.removeNFTFromInventory(contractAddress, tokenId);
                    if (result.success) {
                        return {
                            success: true as const,
                            ...(result.tx && { tx: result.tx })
                        };
                    } else {
                        return {
                            success: false as const,
                            error: result.error || 'Failed to remove NFT from inventory'
                        };
                    }
                } catch (error: any) {
                    return {
                        success: false as const,
                        error: error.message || 'Failed to remove NFT from inventory'
                    };
                }
            },

            /**
             * Add experience points to a specific NFT
             */
            addNFTExperience: async (nftContract: string, tokenId: string) => {
                try {
                    const result = await ShapeXpHelpers.addNFTExperience(nftContract, tokenId);
                    if (result.success) {
                        return {
                            success: true as const,
                            ...(result.transactionHash && { transactionHash: result.transactionHash })
                        };
                    } else {
                        return {
                            success: false as const,
                            error: result.error || 'Failed to add NFT experience'
                        };
                    }
                } catch (error: any) {
                    return {
                        success: false as const,
                        error: error.message || 'Failed to add NFT experience'
                    };
                }
            },

            /**
             * Get experience points for a specific NFT
             */
            getNFTExperience: async (contractAddress: string, tokenId: string) => {
                try {
                    const result = await ShapeXpHelpers.getNFTExperience(contractAddress, tokenId);
                    return {
                        success: true,
                        experience: result.experience
                    };
                } catch (error: any) {
                    return {
                        success: false,
                        error: error.message || 'Failed to fetch NFT experience'
                    };
                }
            },

            /**
             * Add NFT to ShapeXp inventory
             */
            addNFTToInventory: async (contractAddress: string, tokenId: string) => {
                try {
                    const result = await ShapeXpHelpers.addNFTToInventory(contractAddress, tokenId);
                    if (result.success) {
                        return {
                            success: true as const,
                            ...(result.tx && { tx: result.tx })
                        };
                    } else {
                        return {
                            success: false as const,
                            error: result.error || 'Failed to add NFT to inventory'
                        };
                    }
                } catch (error: any) {
                    return {
                        success: false as const,
                        error: error.message || 'Failed to add NFT to inventory'
                    };
                }
            },

            /**
             * Get inventory for current address or specified address
             */
            getInventory: async (address?: string) => {
                try {
                    const targetAddress = address || await getCurrentAddress();
                    const inventory = await ShapeXpHelpers.getInventory(targetAddress);
                    return {
                        success: true,
                        inventory
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to fetch inventory'
                    };
                }
            },

            /**
             * Get all NFTs for current address or specified address
             */
            getNFTs: async (address?: string) => {
                try {
                    const targetAddress = address || await getCurrentAddress();
                    const nfts = await ShapeXpHelpers.getNFTs(targetAddress);
                    return {
                        success: true,
                        nfts
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to fetch NFTs'
                    };
                }
            },

           /**
            * @notice Subscribes to ShapeXp amount changes
            * @dev Sets up event listener for shapexp-update events
            * @param callback Function to execute when ShapeXp changes
            * @custom:events shapexp-update
            * @custom:example
            * ShapeXpAPI.onShapeXpChange((amount) => {
            *   console.log('ShapeXp updated:', amount);
            * });
            */
            onShapeXpChange: (callback: (amount: string) => void) => {
                document.addEventListener('shapexp-update', (e: any) => {
                    callback(e.detail.experience);
                });
            },

           /**
            * @notice Checks if current wallet owns ShapeXp NFT
            * @dev Verifies NFT ownership for connected address
            * @return Promise<boolean> True if wallet owns ShapeXp NFT
            * @custom:requires Connected wallet
            * @custom:example
            * const hasNFT = await ShapeXpAPI.hasShapeXp();
            * console.log('Has ShapeXp NFT:', hasNFT);
            */
            hasShapeXp: async () => {
                const address = await getCurrentAddress();
                return ShapeXpHelpers.ownsShapeXp(address);
            },

           /**
            * @notice Looks up ShapeXp amount for any address
            * @dev Fetches and formats experience points for specified address
            * @param address Ethereum address to look up
            * @return Promise<Object> Success status and ShapeXp data
            * @custom:returns
            * - success: true/false
            * - amount: Formatted ShapeXp amount (if success)
            * - raw: Raw ShapeXp amount (if success)
            * - error: Error message (if !success)
            * @custom:example
            * const data = await ShapeXpAPI.shapeXpLookup("0x123...");
            * if (data.success) {
            *   console.log('ShapeXp amount:', data.amount);
            * }
            */
            shapeXpLookup: async (address: string) => {
                try {
                    const { experience, formatted } = await ShapeXpHelpers.getExperience(address);
                    return {
                        success: true,
                        amount: formatted,
                        raw: experience.toString()
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to fetch ShapeXp'
                    };
                }
            },

           /**
            * @notice Checks ShapeXp NFT ownership for any address
            * @dev Verifies if specified address owns ShapeXp NFT
            * @param address Ethereum address to check
            * @return Promise<Object> Success status and ownership data
            * @custom:returns
            * - success: true/false
            * - hasNFT: Ownership status (if success)
            * - error: Error message (if !success)
            * @custom:example
            * const data = await ShapeXpAPI.shapeXpLookupNFT("0x123...");
            * if (data.success) {
            *   console.log('Owns ShapeXp NFT:', data.hasNFT);
            * }
            */
            shapeXpLookupNFT: async (address: string) => {
                try {
                    const hasNFT = await ShapeXpHelpers.ownsShapeXp(address);
                    return {
                        success: true,
                        hasNFT
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to check NFT ownership'
                    };
                }
            },

        };
    }
}

// Initialize sandbox
new ShapeXpSandbox();

/**
* @notice Global type definitions for ShapeXpAPI
* @dev Extends Window interface with ShapeXpAPI types
* @custom:api-methods
* - getShapeXp
* - onShapeXpChange
* - hasShapeXp
* - shapeXpLookup
* - shapeXpLookupNFT
*/
declare global {
    interface Window {
        ShapeXpAPI: {
            getShapeXp: () => Promise<string>;
            onShapeXpChange: (callback: (amount: string) => void) => void;
            hasShapeXp: () => Promise<boolean>;
            shapeXpLookup: (address: string) => Promise<{
                success: true;
                amount: string;
                raw: string;
            } | {
                success: false;
                error: string;
            }>;
            shapeXpLookupNFT: (address: string) => Promise<{
                success: true;
                hasNFT: boolean;
            } | {
                success: false;
                error: string;
            }>;
            getNFTs: (address?: string) => Promise<{
                success: true;
                nfts: NFTMetadata[];
            } | {
                success: false;
                error: string;
            }>;
            getInventory: (address?: string) => Promise<{
                success: true;
                inventory: InventoryData;
            } | {
                success: false;
                error: string;
            }>;
            addNFTToInventory: (
                contractAddress: string,
                tokenId: string
            ) => Promise<{
                success: true;
                tx?: ContractTransactionResponse;
            } | {
                success: false;
                error: string;
            }>;
            getNFTExperience: (
                contractAddress: string,
                tokenId: string
            ) => Promise<{
                success: true;
                experience: string;
            } | {
                success: false;
                error: string;
            }>;
            addNFTExperience: (
                nftContract: string,
                tokenId: string
            ) => Promise<{
                success: true;
                transactionHash?: string;
            } | {
                success: false;
                error: string;
            }>;
            removeNFTFromInventory: (
                contractAddress: string,
                tokenId: string
            ) => Promise<{
                success: true;
                tx?: ContractTransactionResponse;
            } | {
                success: false;
                error: string;
            }>;
            mintShapeXp: () => Promise<{
                success: true;
                tx?: ContractTransactionResponse;
            } | {
                success: false;
                error: string;
            }>;
            addGlobalExperience: (
                type: keyof typeof ExperienceAmount
            ) => Promise<{
                success: true;
                transactionHash?: string;
            } | {
                success: false;
                error: string;
            }>;
        }
    }
}
