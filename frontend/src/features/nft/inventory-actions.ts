// src/features/nft/inventory-actions.ts
import { getShapeXpContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse, getAddress, Interface } from 'ethers';
import { parseInventoryError } from '../../utils/inventory-error-decoder';

export interface AddToInventoryResult {
    success: boolean;
    error?: string;
    tx?: ContractTransactionResponse;
}

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

