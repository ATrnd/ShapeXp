import { getShapeXpNFTContract } from '../../contracts/contract-instances';
import { ContractTransactionResponse } from 'ethers';

export async function mintShapeXpNFT(): Promise<ContractTransactionResponse> {

    try {
        console.log('--- Initiating mint process... ---');
        const nftContract = await getShapeXpNFTContract();

        console.log('--- Calling ShapeXpNFT mint function ---');
        const tx = await nftContract.mint();
        console.log('--- Mint transaction sent: ---', tx.hash);
        console.log('--- Waiting for transaction confirmation ---');

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('--- Transaction confirmation timeout ---')), 30000);
        });

        try {
            const receipt = await Promise.race([
                tx.wait(1),
                timeoutPromise
            ]);
            console.log('--- Transaction receipt ---', receipt);
            return tx;
        } catch (waitError) {
            console.error('--- Wait error ---', waitError);
            throw waitError;
        }

    } catch (error: any) {
        console.error('--- Detailed minting error ---', {
            message: error.message,
            code: error.code,
            data: error.data,
            transaction: error.transaction
        });
        throw error;
    }
}

