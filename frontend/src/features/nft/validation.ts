/**
* @title ShapeXp NFT Validation Module
* @notice Handles verification of ShapeXp NFT ownership
* @dev Provides utility function for checking if an address has minted a ShapeXp NFT
* @custom:module-hierarchy NFT Validation Component
*/

// src/features/nft/validation.ts
import { getCurrentAddress } from '../../utils/provider';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';

/**
* @notice Verifies if the connected wallet owns a ShapeXp NFT
* @dev Queries the ShapeXp NFT contract to check token ownership
* @return Promise<boolean> True if user owns a ShapeXp NFT, false otherwise
* @custom:flow
* 1. Get NFT contract instance
* 2. Get current user address
* 3. Query contract for token ownership
* @custom:error-handling
* - Returns false on contract errors
* - Returns false if wallet not connected
* - Returns false if contract interaction fails
* @custom:logging
* - Contract address
* - User address
* - Ownership status
*/
export async function checkShapeXpNFTOwnership(): Promise<boolean> {
    try {
        const nftContract = await getShapeXpNFTContract();
        const userAddress = await getCurrentAddress();

        // console.log('Checking NFT ownership for:', {
        //     contract: nftContract.target,
        //     user: userAddress
        // });

        const hasMinted = await nftContract.hasMintedToken(userAddress);
        // console.log('hasMintedToken result:', hasMinted);
        return hasMinted;

    } catch (error: any) {
        console.log('No ShapeXp token found for user');
        return false;
    }
}
