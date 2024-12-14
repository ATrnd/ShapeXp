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

/**
 * @title Experience Addition Module
 * @notice Handles the addition of global experience points to user accounts
 * @dev Implements error handling and parsing for ShapeXp contract interactions
 */

// import { getShapeXpContract } from '../../contracts/contract-instances';
// import { ExperienceAmount } from '../../contracts/abis';
// import { ContractTransactionResponse } from 'ethers';
// import { Interface } from 'ethers';

/**
 * @notice Interface for cooldown error data structure
 * @dev Used for parsing OnCooldown error responses from the contract
 */
// interface OnCooldownError {
//     timeRemaining: bigint;
// }

/**
 * @notice Converts seconds into a human-readable time format
 * @dev Formats time as "Xm Ys" where X is minutes and Y is remaining seconds
 * @param seconds The number of seconds to format
 * @return string Formatted time string in the format "Xm Ys"
 * @example
 * formatTimeRemaining(125n) // Returns "2m 5s"
 */
// function formatTimeRemaining(seconds: bigint): string {
//     const totalSeconds = Number(seconds);
//     const minutes = Math.floor(totalSeconds / 60);
//     const remainingSeconds = totalSeconds % 60;
//     return `${minutes}m ${remainingSeconds}s`;
// }

/**
 * @notice Parses contract errors into human-readable messages
 * @dev Handles specific ShapeXp contract error cases and provides user-friendly messages
 * @param error The error object returned from the contract
 * @return string Human-readable error message
 * @custom:errors Handles the following contract errors:
 * - ShapeXpInvExp__OnCooldown
 * - ShapeXpInvExp__NotShapeXpNFTOwner
 * - ShapeXpInvExp__InvalidExperienceType
 */
// function parseContractError(error: any): string {
//     // Check if error contains data property
//     if (!error.data) {
//         return error.message;
//     }
//
//     try {
//         // Create interface instance to decode errors
//         const iface = new Interface([
//             "error ShapeXpInvExp__OnCooldown(uint256 timeRemaining)",
//             "error ShapeXpInvExp__NotShapeXpNFTOwner()",
//             "error ShapeXpInvExp__InvalidExperienceType()"
//         ]);
//
//         // Extract error data
//         const errorData = error.data;
//
//         // Try to decode the error
//         const decodedError = iface.parseError(errorData);
//
//         if (!decodedError) {
//             return 'Unknown contract error';
//         }
//
//         // Handle specific error types
//         switch(decodedError.name) {
//             case 'ShapeXpInvExp__OnCooldown':
//                 const { timeRemaining } = decodedError.args as unknown as OnCooldownError;
//                 return `Please wait ${formatTimeRemaining(timeRemaining)} before gaining more experience`;
//
//             case 'ShapeXpInvExp__NotShapeXpNFTOwner':
//                 return 'You need to own a ShapeXp NFT to gain experience';
//
//             case 'ShapeXpInvExp__InvalidExperienceType':
//                 return 'Invalid experience type selected';
//
//             default:
//                 return `Contract error: ${decodedError.name}`;
//         }
//     } catch (parseError) {
//         console.error('Error parsing contract error:', parseError);
//         return error.message;
//     }
// }

/**
 * @notice Adds global experience points to the user's account
 * @dev Initiates a transaction to the ShapeXp contract to add experience points
 * @param expType The type of experience to add (LOW, MID, HIGH)
 * @return Promise<ContractTransactionResponse> The transaction response
 */
// export async function addGlobalExperience( expType: ExperienceAmount): Promise<ContractTransactionResponse> {
//     try {
//         console.log('1. --- Starting addGlobalExperience process ---');
//         console.log('2. Experience type:', ExperienceAmount[expType]);
//
//         // Get contract instance
//         const contract = await getShapeXpContract();
//         console.log('3. Contract instance obtained');
//
//         // Call the contract function
//         console.log('4. Calling addGlobalExperience...');
//         const tx = await contract.addGlobalExperience(expType);
//         console.log('5. Transaction sent:', tx.hash);
//
//         // Wait for transaction confirmation
//         console.log('6. Waiting for transaction confirmation...');
//         const timeoutPromise = new Promise((_, reject) => {
//             setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000);
//         });
//
//         try {
//             const receipt = await Promise.race([
//                 tx.wait(1),
//                 timeoutPromise
//             ]);
//             console.log('7. Transaction confirmed:', receipt);
//             return tx;
//         } catch (waitError) {
//             console.error('8. Transaction wait error:', waitError);
//             throw waitError;
//         }
//
//     } catch (error: any) {
//         console.error('Error in addGlobalExperience:', {
//             message: error.message,
//             code: error.code,
//             data: error.data,
//             transaction: error.transaction
//         });
//
//         const readableError = parseContractError(error);
//         throw new Error(readableError);
//     }
// }
//
