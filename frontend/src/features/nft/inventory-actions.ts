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

// export async function addToInventory(
//     contractAddress: string,
//     tokenId: string
// ): Promise<AddToInventoryResult> {
//     try {
//         const contract = await getShapeXpContract();
//         const address = getAddress(contractAddress);
//         const tx = await contract.addNFTToInventory(address, tokenId);
//         await tx.wait();
//         return { success: true, tx };
//     } catch (error: any) {
//         if (error.code === 'ACTION_REJECTED') {
//             return {
//                 success: false,
//                 error: 'Transaction rejected by user',
//             };
//         }
//
//         if (error.data) {
//             try {
//                 const decodedError = errorInterface.parseError(error.data);
//                 if (decodedError) {
//                     return {
//                         success: false,
//                         error: ERROR_MESSAGES[decodedError.name] || 'Unknown contract error',
//                     };
//                 } else {
//                     return {
//                         success: false,
//                         error: 'Failed to parse contract error',
//                     };
//                 }
//             } catch {
//                 return {
//                     success: false,
//                     error: error.message || 'Failed to add NFT to inventory',
//                 };
//             }
//         }
//
//         return {
//             success: false,
//             error: 'Failed to add NFT to inventory',
//         };
//     }
// }
