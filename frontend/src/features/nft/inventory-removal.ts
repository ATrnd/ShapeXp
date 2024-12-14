// src/features/nft/inventory-removal.ts
import { getShapeXpContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse } from 'ethers';
import { parseInventoryError } from '../../utils/inventory-error-decoder';

export interface RemoveFromInventoryResult {
    success: boolean;
    tx?: ContractTransactionResponse;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

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
