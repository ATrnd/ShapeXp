/**
* @title ShapeXp Public Integration API
* @notice Provides public interface for ShapeXp system integration
* @dev Exposes ShapeXpAPI in global window object
* @custom:module-hierarchy Public API Component
*/

import { ShapeXpHelpers } from '../utils/shapexp-helpers';
import { getCurrentAddress } from '../utils/provider';
import { NFTMetadata } from '../features/nft/nft-fetching';
import { InventoryData } from '../features/nft/inventory';
import { ExperienceAmount } from '../contracts/abis';
import { ContractTransactionResponse } from 'ethers';

/**
* @title ShapeXp Integration Interface
* @notice Core class implementing public API functionality
* @dev Initializes global window.ShapeXpAPI object
* @custom:api-version 1.0.0
*/
export class ShapeXpSandbox {
    constructor() {
        window.ShapeXpAPI = {

            /**
             * @notice Gets current account's ShapeXp amount
             * @dev Retrieves formatted experience from app state
             * @return Promise<string> Formatted experience amount
             * @custom:requires Connected wallet
             */
            getShapeXp: async () => {
                const appState = (window as any).appState;
                return appState.getFormattedExperience();
            },

            /**
             * @notice Mints new ShapeXp NFT
             * @dev Handles complete minting process
             * @return Promise<{success: boolean, tx?: ContractTransactionResponse, error?: string}>
             * @custom:requires No existing ShapeXp NFT
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
             * @notice Adds global experience points
             * @dev Processes experience gain with cooldown check
             * @param type Experience amount type (LOW, MID, HIGH)
             * @return Promise with transaction result
             * @custom:requires
             * - ShapeXp NFT ownership
             * - Not in cooldown
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
             * @notice Removes NFT from ShapeXp inventory
             * @dev Handles complete NFT removal process
             * @param contractAddress The NFT contract address
             * @param tokenId The NFT token ID
             * @return Promise<{success: boolean, tx?: ContractTransactionResponse, error?: string}>
             * @custom:requires
             * - NFT must be in inventory
             * - ShapeXp NFT ownership
             * - User owns the NFT
             * @custom:example
             * const result = await ShapeXpAPI.removeNFTFromInventory("0x123...", "1");
             * if (result.success) {
             *   console.log('NFT removed:', result.tx?.hash);
             * }
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
             * @notice Adds experience points to NFT
             * @dev Transfers experience from global pool to specific NFT
             * @param nftContract The NFT contract address
             * @param tokenId The NFT token ID
             * @return Promise<{success: boolean, transactionHash?: string, error?: string}>
             * @custom:requires
             * - NFT in inventory
             * - Sufficient global experience
             * - Not in cooldown
             * - ShapeXp NFT ownership
             * @custom:example
             * const result = await ShapeXpAPI.addNFTExperience("0x123...", "1");
             * if (result.success) {
             *   console.log('Experience added:', result.transactionHash);
             * }
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
             * @notice Retrieves NFT experience amount
             * @dev Fetches current experience points for specific NFT
             * @param contractAddress The NFT contract address
             * @param tokenId The NFT token ID
             * @return Promise<{success: boolean, experience?: string, error?: string}>
             * @custom:requires
             * - NFT must exist
             * - NFT in inventory
             * @custom:example
             * const result = await ShapeXpAPI.getNFTExperience("0x123...", "1");
             * if (result.success) {
             *   console.log('NFT experience:', result.experience);
             * }
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
             * @notice Adds NFT to ShapeXp inventory
             * @dev Handles complete inventory addition process
             * @param contractAddress The NFT contract address
             * @param tokenId The NFT token ID
             * @return Promise<{success: boolean, tx?: ContractTransactionResponse, error?: string}>
             * @custom:requires
             * - Available inventory slot
             * - ShapeXp NFT ownership
             * - User owns the NFT
             * - NFT not already in inventory
             * @custom:example
             * const result = await ShapeXpAPI.addNFTToInventory("0x123...", "1");
             * if (result.success) {
             *   console.log('NFT added:', result.tx?.hash);
             * }
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
             * @notice Retrieves current inventory state
             * @dev Fetches complete inventory data for an address
             * @param address Optional Ethereum address (uses connected wallet if omitted)
             * @return Promise<{success: boolean, inventory?: InventoryData, error?: string}>
             * @custom:returns
             * - success: Operation status
             * - inventory: Current inventory state if successful
             * - error: Error message if failed
             * @custom:example
             * const result = await ShapeXpAPI.getInventory();
             * if (result.success) {
             *   console.log('Inventory slots:', result.inventory.slots);
             * }
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
             * @notice Retrieves all NFTs for an address
             * @dev Fetches NFT data from Alchemy API
             * @param address Optional address (uses connected wallet if omitted)
             * @return Promise<{success: boolean, nfts?: NFTMetadata[]}>
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
             * @dev Sets up event listener for experience updates
             * @param callback Function executed on experience change
             * @custom:events shapexp-update
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
