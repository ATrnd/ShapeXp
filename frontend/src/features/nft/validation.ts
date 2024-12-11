// src/features/nft/validation.ts
import { getCurrentAddress } from '../../utils/provider';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';

export async function checkShapeXpNFTOwnership(): Promise<boolean> {
    try {

        const nftContract = await getShapeXpNFTContract();
        const userAddress = await getCurrentAddress();
        console.log('NFT Contract for validation:', {
            address: nftContract.target,
            userAddress: userAddress
        });

        const hasMinted = await nftContract.hasMintedToken(userAddress);
        console.log('hasMintedToken result:', hasMinted);

        return hasMinted;

    } catch (error: any) {
        console.error('Error in hasMintedToken check:', {
            error,
            message: error.message
        });
        return false;
    }
}
