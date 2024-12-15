/**
* @title ShapeXp NFT Minting Controller
* @notice Manages the minting process for ShapeXp NFTs
* @dev Handles complete minting lifecycle with gas estimation
* @custom:module-hierarchy Core NFT Management Component
*/
import { getShapeXpNFTContract } from '../../contracts/contract-instances';
import { parseMintError } from '../../utils/mint-error-decoder';
import { ContractTransactionResponse } from 'ethers';

/**
* @notice Minting operation result interface
* @dev Defines the structure for mint operation results
* @custom:returns
* - success: Operation success status
* - tx: Optional transaction response
* - error: Optional error details with code and message
*/
export interface MintResult {
    success: boolean;
    tx?: ContractTransactionResponse;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
* @notice Mints a new ShapeXp NFT
* @dev Handles the complete minting process with gas estimation
* @return Promise<MintResult> Result of the minting operation
* @custom:flow
* 1. Get NFT contract instance
* 2. Estimate gas for transaction
* 3. Add gas buffer (20%)
* 4. Submit mint transaction
* 5. Wait for confirmation
* 6. Process result
* @custom:errors
* - Already minted
* - Transaction rejected
* - Gas estimation failure
* - Network errors
* @custom:events
* - NFT minted event
* @custom:requirements
* - No existing ShapeXp NFT
* - Connected wallet
* - Sufficient ETH for gas
*/
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
