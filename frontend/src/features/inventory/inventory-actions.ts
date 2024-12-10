// src/features/inventory-actions.ts

import { getShapeXpContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse, getAddress, Interface } from 'ethers';

interface AddToInventoryResult {
    success: boolean;
    error?: string;
}

// Define contract errors interface
const errorInterface = new Interface([
    "error ShapeXpInvExp__NFTAlreadyInInventory()",
    "error ShapeXpInvExp__InventoryFull()",
    "error ShapeXpInvExp__NotNFTOwner()",
    "error ShapeXpInvExp__NotShapeXpNFTOwner()",
    "error ShapeXpInvExp__InvalidERC721Contract()"
]);

// Map error signatures to human-readable messages
const ERROR_MESSAGES: { [key: string]: string } = {
    "ShapeXpInvExp__NFTAlreadyInInventory": "This NFT is already in your inventory",
    "ShapeXpInvExp__InventoryFull": "Your inventory is full (max 3 NFTs)",
    "ShapeXpInvExp__NotNFTOwner": "You don't own this NFT",
    "ShapeXpInvExp__NotShapeXpNFTOwner": "You need to mint a ShapeXp NFT first",
    "ShapeXpInvExp__InvalidERC721Contract": "Invalid NFT contract"
};

export async function addNFTToInventory(
    contractAddress: string,
    tokenId: string
): Promise<AddToInventoryResult> {
    try {
        const contract = await getShapeXpContract();
        const address = getAddress(contractAddress);

        const tx = await contract.addNFTToInventory(address, tokenId);
        await tx.wait();

        return { success: true };
    } catch (error: any) {
        // Handle user rejection
        if (error.code === 'ACTION_REJECTED') {
            return {
                success: false,
                error: 'Transaction rejected by user'
            };
        }

        // Handle contract errors
        if (error.data) {
            try {
                const decodedError = errorInterface.parseError(error.data);
                if (decodedError) {
                    return {
                        success: false,
                        error: ERROR_MESSAGES[decodedError.name] || 'Unknown contract error',
                    };
                } else {
                    return {
                        success: false,
                        error: 'Failed to decode contract error',
                    };
                }
            } catch {
                return {
                    success: false,
                    error: error.message || 'Failed to add NFT to inventory',
                };
            }
        }

        // Fallback error
        return {
            success: false,
            error: 'Failed to add NFT to inventory'
        };
    }
}
