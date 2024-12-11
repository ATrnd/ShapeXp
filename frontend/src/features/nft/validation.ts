import { getCurrentAddress } from '../../utils/provider';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';

// export async function checkShapeXpNFTOwnership(): Promise<boolean> {
//     try {
//         const nftContract = await getShapeXpNFTContract();
//         const userAddress = await getCurrentAddress();
//         const hasMinted = await nftContract.hasMintedToken(userAddress);
//         return hasMinted;
//     } catch (error: any) {
//         console.error('Error checking NFT ownership:', error);
//         throw error;
//     }
// }

export async function checkShapeXpNFTOwnership(): Promise<boolean> {
    try {
        const nftContract = await getShapeXpNFTContract();
        const userAddress = await getCurrentAddress();
        console.log('Checking NFT ownership for address:', userAddress);
        console.log('Using NFT contract:', nftContract.target);

        const hasMinted = await nftContract.hasMintedToken(userAddress);
        console.log('Has minted result:', hasMinted);

        return hasMinted;
    } catch (error: any) {
        console.log('Error checking NFT ownership:', {
            error,
            message: error.message,
            code: error.code,
            data: error.data
        });

        // Instead of throwing, return false for a better user experience
        return false;
    }
}
