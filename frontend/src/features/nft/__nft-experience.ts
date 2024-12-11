// src/features/nft-experience.ts

// 1. Import necessary dependencies
import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';

// 2. Define interface for the return value
interface NFTExperienceResult {
    experience: string;  // Using string to handle large numbers safely
    error?: string;
}

/**
 * Fetches experience points for a specific NFT
 * @param contractAddress - The NFT contract address
 * @param tokenId - The NFT token ID
 * @returns Promise with experience amount or error
 */
export async function getNFTExperience(
    contractAddress: string,
    tokenId: string
): Promise<NFTExperienceResult> {
    try {
        // 3. Get the contract instance
        const contract = await getShapeXpContract();

        // 4. Get current user's address
        const userAddress = await getCurrentAddress();

        console.log('Fetching NFT experience for:', {
            user: userAddress,
            contract: contractAddress,
            tokenId: tokenId
        });

        // 5. Call the contract method
        const experience = await contract.getNFTExperience(
            userAddress,
            contractAddress,
            tokenId
        );

        // 6. Format and return the result
        return {
            experience: experience.toString()
        };

    } catch (error: any) {
        // 7. Handle errors
        console.error('Error fetching NFT experience:', error);

        return {
            experience: '0',
            error: error.message || 'Failed to fetch NFT experience'
        };
    }
}

