/**
* @title NFT Inventory Action Controller
* @notice Manages NFT inventory addition operations for ShapeXp system
* @dev Handles inventory additions with comprehensive error handling
* @custom:module-hierarchy Inventory Management Component
*/

import { getShapeXpContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse, getAddress, Interface } from 'ethers';
import { parseInventoryError } from '../../utils/inventory-error-decoder';

/**
* @notice Inventory addition result interface
* @dev Defines the structure for inventory operation results
* @custom:returns
* - success: Operation success status
* - error: Optional error message
* - tx: Optional transaction response
*/
export interface AddToInventoryResult {
    success: boolean;
    error?: string;
    tx?: ContractTransactionResponse;
}

/**
* @notice Adds an NFT to the ShapeXp inventory
* @dev Handles the complete inventory addition process with error handling
* @param contractAddress The NFT contract address
* @param tokenId The NFT token ID
* @return Promise<AddToInventoryResult> Result of the inventory addition
* @custom:requirements
* - Valid NFT contract address
* - User owns the NFT
* - Available inventory slot
* - User owns ShapeXp NFT
* @custom:errors
* - Invalid contract
* - NFT not owned
* - Inventory full
* - Already in inventory
* @custom:events
* - NFT added to inventory
* @custom:flow
* 1. Get contract instance
* 2. Submit addition transaction
* 3. Wait for confirmation
* 4. Process result
*/
export async function addToInventory(
    contractAddress: string,
    tokenId: string
): Promise<AddToInventoryResult> {
    try {
        const contract = await getShapeXpContract();
        const tx = await contract.addNFTToInventory(contractAddress, tokenId);
        await tx.wait();

        return { success: true, tx };
    } catch (error: any) {
        const parsedError = parseInventoryError(error);

        console.log('[shapeXp :: Inventory error]', {
            code: parsedError.code,
            message: parsedError.message,
            details: parsedError.details,
            originalError: error
        });

        return {
            success: false,
            error: parsedError.message
        };
    }
}

