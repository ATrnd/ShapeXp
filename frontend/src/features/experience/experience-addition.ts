import { getShapeXpContract } from '../../contracts/contract-instances';
import { ExperienceAmount } from '../../contracts/abis';
import { ContractTransactionResponse } from 'ethers';
import { Interface } from 'ethers';

interface OnCooldownError {
    timeRemaining: bigint;
}

/**
 * Formats time in seconds to a human-readable string
 */
function formatTimeRemaining(seconds: bigint): string {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Parses contract error and returns human-readable message
 */
function parseContractError(error: any): string {
    // Check if error contains data property
    if (!error.data) {
        return error.message;
    }

    try {
        // Create interface instance to decode errors
        const iface = new Interface([
            "error ShapeXpInvExp__OnCooldown(uint256 timeRemaining)",
            "error ShapeXpInvExp__NotShapeXpNFTOwner()",
            "error ShapeXpInvExp__InvalidExperienceType()"
        ]);

        // Extract error data
        const errorData = error.data;

        // Try to decode the error
        const decodedError = iface.parseError(errorData);

        if (!decodedError) {
            return 'Unknown contract error';
        }

        // Handle specific error types
        switch(decodedError.name) {
            case 'ShapeXpInvExp__OnCooldown':
                const { timeRemaining } = decodedError.args as unknown as OnCooldownError;
                return `Please wait ${formatTimeRemaining(timeRemaining)} before gaining more experience`;

            case 'ShapeXpInvExp__NotShapeXpNFTOwner':
                return 'You need to own a ShapeXp NFT to gain experience';

            case 'ShapeXpInvExp__InvalidExperienceType':
                return 'Invalid experience type selected';

            default:
                return `Contract error: ${decodedError.name}`;
        }
    } catch (parseError) {
        console.error('Error parsing contract error:', parseError);
        return error.message;
    }
}

/**
 * Adds global experience points to the user's account
 * @param expType - The type of experience to add (LOW, MID, HIGH)
 * @returns Promise with the transaction response
 */
export async function addGlobalExperience( expType: ExperienceAmount): Promise<ContractTransactionResponse> {
    try {
        console.log('1. --- Starting addGlobalExperience process ---');
        console.log('2. Experience type:', ExperienceAmount[expType]);

        // Get contract instance
        const contract = await getShapeXpContract();
        console.log('3. Contract instance obtained');

        // Call the contract function
        console.log('4. Calling addGlobalExperience...');
        const tx = await contract.addGlobalExperience(expType);
        console.log('5. Transaction sent:', tx.hash);

        // Wait for transaction confirmation
        console.log('6. Waiting for transaction confirmation...');
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000);
        });

        try {
            const receipt = await Promise.race([
                tx.wait(1),
                timeoutPromise
            ]);
            console.log('7. Transaction confirmed:', receipt);
            return tx;
        } catch (waitError) {
            console.error('8. Transaction wait error:', waitError);
            throw waitError;
        }

    } catch (error: any) {
        console.error('Error in addGlobalExperience:', {
            message: error.message,
            code: error.code,
            data: error.data,
            transaction: error.transaction
        });

        const readableError = parseContractError(error);
        throw new Error(readableError);
    }
}

