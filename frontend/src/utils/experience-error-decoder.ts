/**
 * @title Experience Error Decoder
 * @notice Decodes and formats ShapeXp experience system errors
 * @dev Uses ethers.js Interface for error decoding
 */

import { Interface } from 'ethers';
import {
    ExperienceErrorSignatures,
    ExperienceErrorMessages,
    ExperienceErrorCodes,
    OnCooldownError
} from '../types/experience-errors';

/**
 * @notice Formats time duration into readable string
 * @param seconds Time in seconds as bigint
 * @return string Formatted time string
 */
function formatTimeRemaining(seconds: bigint): string {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * @notice Parses experience system errors into developer-friendly format
 * @param error The error object from contract interaction
 * @return Object containing error details and user message
 */
export function parseExperienceError(error: any): {
    code: string;
    message: string;
    details?: any;
} {
    // Handle user rejection
    if (error.code === 'ACTION_REJECTED') {
        return {
            code: ExperienceErrorCodes.USER_REJECTED,
            message: ExperienceErrorMessages.UserRejected
        };
    }

    try {
        // First, try to get error data from estimate gas error
        let errorData;

        if (error.data) {
            errorData = error.data;
        } else if (error.message && error.message.includes('execution reverted')) {
            // Extract error data from revert message
            const match = error.message.match(/data="([^"]+)"/);
            if (match) {
                errorData = match[1];
            }
        }

        if (errorData) {
            const iface = new Interface([
                `error ${ExperienceErrorSignatures.OnCooldown}`,
                `error ${ExperienceErrorSignatures.NotShapeXpNFTOwner}`,
                `error ${ExperienceErrorSignatures.InvalidExperienceType}`,
                `error ${ExperienceErrorSignatures.InsufficientGlobalExperience}`
            ]);

            try {
                // Handle both full error data and hex string
                const decodedError = iface.parseError(
                    errorData.startsWith('0x') ? errorData : `0x${errorData}`
                );

                if (decodedError) {
                    switch(decodedError.name) {
                        case 'ShapeXpInvExp__OnCooldown': {
                            const timeRemaining = decodedError.args[0];
                            const formattedTime = formatTimeRemaining(timeRemaining);
                            return {
                                code: ExperienceErrorCodes.ON_COOLDOWN,
                                message: ExperienceErrorMessages.OnCooldown(formattedTime),
                                details: { timeRemaining: timeRemaining.toString() }
                            };
                        }
                        case 'ShapeXpInvExp__NotShapeXpNFTOwner':
                            return {
                                code: ExperienceErrorCodes.NOT_NFT_OWNER,
                                message: ExperienceErrorMessages.NotShapeXpNFTOwner
                            };
                        case 'ShapeXpInvExp__InvalidExperienceType':
                            return {
                                code: ExperienceErrorCodes.INVALID_TYPE,
                                message: ExperienceErrorMessages.InvalidExperienceType
                            };
                        case 'ShapeXpInvExp__InsufficientGlobalExperience':
                            return {
                                code: ExperienceErrorCodes.INSUFFICIENT_EXPERIENCE,
                                message: ExperienceErrorMessages.InsufficientGlobalExperience
                            };
                        default:
                            return {
                                code: ExperienceErrorCodes.UNKNOWN,
                                message: `Unknown contract error: ${decodedError.name}`
                            };
                    }
                }
            } catch (decodeError) {
                console.debug('Error decoding data:', decodeError);
            }
        }

        // If we couldn't decode the error, try to extract meaning from the message
        if (error.message) {
            if (error.message.includes('cooldown')) {
                return {
                    code: ExperienceErrorCodes.ON_COOLDOWN,
                    message: 'Experience gain is on cooldown'
                };
            }
        }

        return {
            code: ExperienceErrorCodes.UNKNOWN,
            message: error.message || ExperienceErrorMessages.Unknown,
            details: error
        };

    } catch (parseError) {
        console.error('Error parsing experience error:', parseError);
        return {
            code: ExperienceErrorCodes.UNKNOWN,
            message: error.message || ExperienceErrorMessages.Unknown,
            details: { parseError, originalError: error }
        };
    }
}
