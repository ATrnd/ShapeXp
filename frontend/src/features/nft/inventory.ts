/**
* @title NFT Inventory Management System
* @notice Core inventory management functionality for ShapeXp system
* @dev Handles inventory data structures and fetching operations
* @custom:module-hierarchy Core Inventory Component
*/

import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';

/**
* @notice Inventory system constants
* @dev Core configuration values for inventory system
* @custom:configuration
* - Empty address for unfilled slots
* - Maximum inventory capacity
*/
export const INVENTORY = {
    EMPTY_ADDRESS: "0x0000000000000000000000000000000000000000",
    MAX_SLOTS: 3
} as const;

/**
* @notice Inventory slot data structure
* @dev Represents a single inventory slot
* @custom:fields
* - nftContract: NFT contract address
* - tokenId: NFT token identifier
* - isEmpty: Slot availability status
* - metadata: Optional NFT metadata
*/
export interface InventorySlot {
    nftContract: string;
    tokenId: string;
    isEmpty: boolean;
    metadata?: {
        name?: string;
        imageUrl?: string;
    };
}

/**
* @notice Complete inventory data structure
* @dev Contains all inventory slots and capacity information
* @custom:fields
* - slots: Array of inventory slots
* - totalSlots: Maximum inventory capacity
*/
export interface InventoryData {
    slots: InventorySlot[];
    totalSlots: number;
}

/**
* @notice Fetches complete inventory data for an address
* @dev Retrieves and formats inventory data from contract
* @param address The address to fetch inventory for
* @return Promise<InventoryData> Complete inventory data
* @custom:flow
* 1. Get contract instance
* 2. Fetch raw inventory data
* 3. Process and format slots
* 4. Return formatted inventory
* @custom:errors
* - Contract interaction failures
* - Invalid address format
* - Network issues
* @custom:requirements
* - Valid Ethereum address
* - Active network connection
*/
export async function fetchInventory(address: string): Promise<InventoryData> {
    try {
        const contract = await getShapeXpContract();
        const [nftContracts, tokenIds] = await contract.viewInventory(address);

        const slots: InventorySlot[] = await Promise.all(
            nftContracts.map(async (contract: string, index: number) => {
                const isEmpty = contract === INVENTORY.EMPTY_ADDRESS;
                return {
                    nftContract: contract,
                    tokenId: tokenIds[index].toString(),
                    isEmpty
                };
            })
        );

        return {
            slots,
            totalSlots: INVENTORY.MAX_SLOTS
        };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}
