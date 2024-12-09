import { getCurrentAddress } from '../../utils/provider';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';

export async function checkShapeXpNFTOwnership(): Promise<boolean> {
    try {
        const nftContract = await getShapeXpNFTContract();
        const userAddress = await getCurrentAddress();
        const hasMinted = await nftContract.hasMintedToken(userAddress);
        return hasMinted;
    } catch (error: any) {
        console.error('Error checking NFT ownership:', error);
        throw error;
    }
}
