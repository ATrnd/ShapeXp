/**
* @title NFT Inventory Removal Controller
* @notice Manages NFT removal operations from ShapeXp inventory
* @dev Handles inventory removals with comprehensive error handling
* @custom:module-hierarchy Inventory Management Component
*/
import { getShapeXpContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse } from 'ethers';
import { parseInventoryError } from '../../utils/inventory-error-decoder';

/**
* @notice Inventory removal result interface
* @dev Defines the structure for removal operation results
* @custom:returns
* - success: Operation success status
* - tx: Optional transaction response
* - error: Optional error details
*/
export interface RemoveFromInventoryResult {
    success: boolean;
    tx?: ContractTransactionResponse;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
* @notice Removes an NFT from the ShapeXp inventory
* @dev Handles complete NFT removal process with error handling
* @param contractAddress The NFT contract address to remove
* @param tokenId The NFT token ID to remove
* @return Promise<RemoveFromInventoryResult> Result of the removal operation
* @custom:requirements
* - User owns ShapeXp NFT
* - NFT exists in inventory
* - User still owns the NFT
* @custom:errors
* - NFT not in inventory
* - User no longer owns NFT
* - No ShapeXp NFT ownership
* @custom:events
* - NFT removed from inventory
* @custom:flow
* 1. Get contract instance
* 2. Submit removal transaction
* 3. Wait for confirmation
* 4. Process result and cleanup
*/
export async function removeFromInventory(
    contractAddress: string,
    tokenId: string
): Promise<RemoveFromInventoryResult> {
    try {
        const contract = await getShapeXpContract();
        console.log('Removing NFT from inventory:', { contractAddress, tokenId });

        const tx = await contract.removeNFTFromInventory(contractAddress, tokenId);
        await tx.wait();

        return {
            success: true,
            tx
        };
    } catch (error: any) {
        const parsedError = parseInventoryError(error);

        console.log('[shapeXp :: NFT removal error]', {
            code: parsedError.code,
            message: parsedError.message,
            details: parsedError.details,
            originalError: error
        });

        return {
            success: false,
            error: parsedError
        };
    }
}
