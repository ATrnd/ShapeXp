// src/features/nft/nft-experience.ts
import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';
import { Interface } from 'ethers';

export interface NFTExperienceResult {
    experience: string;
    error?: string;
}

export interface AddNFTExperienceResult {
    success: boolean;
    error?: string;
    transactionHash?: string;
}

const errorInterface = new Interface([
    "error ShapeXpInvExp__NotShapeXpNFTOwner()",
    "error ShapeXpInvExp__NotNFTOwner()",
    "error ShapeXpInvExp__NotInInventory()",
    "error ShapeXpInvExp__InsufficientGlobalExperience()",
    "error ShapeXpInvExp__OnCooldown(uint256 timeRemaining)"
]);

const ERROR_MESSAGES: { [key: string]: string } = {
    "ShapeXpInvExp__NotShapeXpNFTOwner": "You need to mint a ShapeXp NFT first",
    "ShapeXpInvExp__NotNFTOwner": "You don't own this NFT",
    "ShapeXpInvExp__NotInInventory": "This NFT is not in your inventory",
    "ShapeXpInvExp__InsufficientGlobalExperience": "Insufficient global experience",
    "ShapeXpInvExp__OnCooldown": "Please wait before adding more experience"
};

export async function getNFTExperience(
    contractAddress: string,
    tokenId: string
): Promise<NFTExperienceResult> {
    try {
        const contract = await getShapeXpContract();
        const userAddress = await getCurrentAddress();

        console.log('Fetching NFT experience for:', {
            user: userAddress,
            contract: contractAddress,
            tokenId: tokenId
        });

        const experience = await contract.getNFTExperience(
            userAddress,
            contractAddress,
            tokenId
        );

        return {
            experience: experience.toString()
        };
    } catch (error: any) {
        console.error('Error fetching NFT experience:', error);
        return {
            experience: '0',
            error: error.message || 'Failed to fetch NFT experience'
        };
    }
}

export async function addNFTExperience(
    nftContract: string,
    tokenId: string
): Promise<AddNFTExperienceResult> {
    try {
        const contract = await getShapeXpContract();
        const tx = await contract.addNFTExperience(nftContract, tokenId);
        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: receipt?.hash
        };
    } catch (error: any) {
        if (error.code === 'ACTION_REJECTED') {
            return {
                success: false,
                error: 'Transaction rejected by user'
            };
        }

        if (error.data) {
            try {
                const decodedError = errorInterface.parseError(error.data);
                if (decodedError) {
                    if (decodedError.name === 'ShapeXpInvExp__OnCooldown') {
                        const timeRemaining = decodedError.args[0];
                        const seconds = Number(timeRemaining);
                        const minutes = Math.floor(seconds / 60);
                        const remainingSeconds = seconds % 60;
                        return {
                            success: false,
                            error: `Please wait ${minutes}m ${remainingSeconds}s before adding more experience`
                        };
                    }
                    return {
                        success: false,
                        error: ERROR_MESSAGES[decodedError.name] || 'Unknown contract error'
                    };
                }
            } catch (parseError) {
                console.error('Error parsing contract error:', parseError);
            }
        }

        return {
            success: false,
            error: error.message || 'Failed to add NFT experience'
        };
    }
}
