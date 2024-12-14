/**
 * @title Mint Error Decoder
 * @notice Decodes and formats ShapeXp NFT minting errors
 */

import { Interface, AbiCoder } from 'ethers';
import {
    ShapeXpNFTErrorSignatures,
    ShapeXpNFTErrorMessages,
    AlreadyMintedError
} from '../types/minting-errors';

export function parseMintError(error: any): {
    code: string;
    message: string;
    details?: any;
} {
    // Handle user rejection
    if (error.code === 'ACTION_REJECTED') {
        return {
            code: 'USER_REJECTED',
            message: ShapeXpNFTErrorMessages.UserRejected
        };
    }

    try {
        // Check if error data exists in different places
        const errorData = error.data || error.error?.data;

        // If we have error data, try to decode it
        if (errorData) {
            // Create interface for error decoding
            const iface = new Interface([
                `error ${ShapeXpNFTErrorSignatures.AlreadyMinted}`,
                `error ${ShapeXpNFTErrorSignatures.TransfersNotAllowed}`,
                `error ${ShapeXpNFTErrorSignatures.ApprovalNotAllowed}`
            ]);

            try {
                const decodedError = iface.parseError(errorData);

                if (decodedError) {
                    switch (decodedError.name) {
                        case 'ShapeXpNFT__AlreadyMinted': {
                            // Extract minter address from transaction data
                            const minter = error.transaction?.from || 'unknown address';
                            return {
                                code: 'ALREADY_MINTED',
                                message: ShapeXpNFTErrorMessages.AlreadyMinted(minter),
                                details: { minter }
                            };
                        }
                        // ... other cases remain the same
                    }
                }
            } catch (decodeError) {
                console.debug('Error decoding data:', decodeError);
            }
        }

        // Check for specific error messages in the error string
        const errorString = error.message?.toLowerCase() || '';
        if (errorString.includes('already minted')) {
            const minter = error.transaction?.from || 'unknown address';
            return {
                code: 'ALREADY_MINTED',
                message: ShapeXpNFTErrorMessages.AlreadyMinted(minter),
                details: { minter }
            };
        }

        // Default error case
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || ShapeXpNFTErrorMessages.Unknown,
            details: error
        };

    } catch (parseError) {
        console.error('Error parsing mint error:', parseError);
        return {
            code: 'PARSE_ERROR',
            message: error.message || ShapeXpNFTErrorMessages.Unknown,
            details: { parseError, originalError: error }
        };
    }
}
