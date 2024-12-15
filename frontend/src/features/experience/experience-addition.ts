/**
 * @title Experience Addition Module
 * @notice Handles the addition of global experience points
 * @dev Implements comprehensive error handling for experience gains
 */

import { getShapeXpContract } from '../../contracts/contract-instances';
import { ExperienceAmount } from '../../contracts/abis';
import { parseExperienceError } from '../../utils/experience-error-decoder';

export interface ExperienceResult {
    success: boolean;
    transactionHash?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * @notice Adds global experience points to user's account
 * @param expType Type of experience to add (LOW, MID, HIGH)
 * @return Promise<ExperienceResult> Result object with success status and error details
 */
export async function addGlobalExperience(expType: ExperienceAmount): Promise<ExperienceResult> {
    try {
        console.log('Starting experience addition:', {
            type: ExperienceAmount[expType],
            timestamp: new Date().toISOString()
        });

        const contract = await getShapeXpContract();
        console.log('Using contract:', contract.target);

        const tx = await contract.addGlobalExperience(expType);
        console.log('Transaction sent:', tx.hash);

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000);
        });

        const receipt = await Promise.race([
            tx.wait(1),
            timeoutPromise
        ]);

        console.log('Transaction confirmed:', {
            hash: receipt.hash,
            blockNumber: receipt.blockNumber
        });

        return {
            success: true,
            transactionHash: receipt.hash
        };

    } catch (error: any) {
        const parsedError = parseExperienceError(error);

        console.log('[shapeXp :: Experience addition error]', {
            code: parsedError.code,
            message: parsedError.message,
            details: parsedError.details,
            timestamp: new Date().toISOString(),
            originalError: error
        });

        return {
            success: false,
            error: parsedError
        };
    }
}

