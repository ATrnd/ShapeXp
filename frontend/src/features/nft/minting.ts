// src/features/nft/minting.ts
import { getShapeXpNFTContract } from '../../contracts/contract-instances';
import { parseMintError } from '../../utils/mint-error-decoder';
import { ContractTransactionResponse } from 'ethers';

export interface MintResult {
    success: boolean;
    tx?: ContractTransactionResponse;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export async function mintShapeXpNFT(): Promise<MintResult> {
    try {
        console.log('1. Initiating mint process...');
        const nftContract = await getShapeXpNFTContract();
        console.log('2. Got NFT contract:', nftContract.target);

        console.log('3. Estimating gas...');
        const gasLimit = await nftContract.mint.estimateGas();
        console.log('4. Estimated gas:', gasLimit.toString());

        console.log('5. Calling ShapeXpNFT mint function');
        const tx = await nftContract.mint({
            gasLimit: gasLimit * BigInt(12) / BigInt(10) // Add 20% buffer
        });
        console.log('6. Mint transaction sent:', tx.hash);

        console.log('7. Waiting for transaction confirmation...');
        const receipt = await tx.wait(1);
        console.log('8. Transaction confirmed:', receipt.hash);

        await new Promise(resolve => setTimeout(resolve, 3000));

        return {
            success: true,
            tx
        };

    } catch (error: any) {
        const parsedError = parseMintError(error);

        console.log('[shapeXp :: Minting error]', {
            code: parsedError.code,
            message: parsedError.message,
            details: parsedError.details,
            originalError: error
        }, );

        return {
            success: false,
            error: parsedError
        };
    }
}
