/**
 * @title Inventory Error Decoder
 * @notice Decodes and formats ShapeXp inventory system errors
 */
import { Interface } from 'ethers';
import {
    InventoryErrorSignatures,
    InventoryErrorCodes,
    InventoryErrorMessages,
    InventoryErrorDetails
} from '../types/inventory-errors';

/**
 * @notice Parses inventory operation errors into user-friendly format
 * @dev Handles multiple error scenarios:
 * - User rejected transactions
 * - Contract revert errors
 * - Gas estimation failures
 * - General execution errors
 *
 * @param error The raw error object from contract interaction
 * @return InventoryErrorDetails Standardized error object containing:
 *  - code: Enumerated error code
 *  - message: Human-readable error message
 *  - details: (optional) Additional error context
 *
 * @custom:errors Handles the following contract errors:
 * - ShapeXpInvExp__InvalidERC721Contract: Invalid NFT contract
 * - ShapeXpInvExp__InventoryFull: No available inventory slots
 * - ShapeXpInvExp__NFTAlreadyInInventory: Duplicate NFT addition
 * - ShapeXpInvExp__NotInInventory: NFT not found in inventory
 * - ShapeXpInvExp__NotNFTOwner: Missing NFT ownership
 * - ShapeXpInvExp__NFTNotInInventory: NFT not found for removal
 */
export function parseInventoryError(error: any): InventoryErrorDetails {
    // Handle user rejection
    if (error.code === 'ACTION_REJECTED') {
        return {
            code: InventoryErrorCodes.USER_REJECTED,
            message: InventoryErrorMessages.UserRejected
        };
    }

    try {
        // Extract error data from different possible locations
        let errorData = error.data || error.error?.data;

        // Handle gas estimation errors
        if (error.message && error.message.includes('execution reverted')) {
            const match = error.message.match(/data="([^"]+)"/);
            if (match) {
                errorData = match[1];
            }
        }

        if (errorData) {
            const iface = new Interface(
                Object.values(InventoryErrorSignatures).map(sig => `error ${sig}`)
            );

            try {
                const decodedError = iface.parseError(
                    errorData.startsWith('0x') ? errorData : `0x${errorData}`
                );

                if (decodedError) {
                    switch(decodedError.name) {
                        case 'ShapeXpInvExp__InvalidERC721Contract':
                            return {
                            code: InventoryErrorCodes.INVALID_CONTRACT,
                            message: InventoryErrorMessages.InvalidERC721Contract
                        };

                        case 'ShapeXpInvExp__InventoryFull':
                            return {
                            code: InventoryErrorCodes.INVENTORY_FULL,
                            message: InventoryErrorMessages.InventoryFull
                        };

                        case 'ShapeXpInvExp__NFTAlreadyInInventory':
                            return {
                            code: InventoryErrorCodes.NFT_ALREADY_IN_INVENTORY,
                            message: InventoryErrorMessages.NFTAlreadyInInventory
                        };

                        case 'ShapeXpInvExp__NotInInventory':
                            return {
                            code: InventoryErrorCodes.NOT_IN_INVENTORY,
                            message: InventoryErrorMessages.NotInInventory
                        };

                        case 'ShapeXpInvExp__NotNFTOwner':
                            return {
                            code: InventoryErrorCodes.NOT_NFT_OWNER,
                            message: InventoryErrorMessages.NotNFTOwner
                        };

                        case 'ShapeXpInvExp__NFTNotInInventory':
                            return {
                            code: InventoryErrorCodes.REMOVAL_NFT_NOT_FOUND,
                            message: InventoryErrorMessages.RemovalNFTNotFound
                        };

                        default:
                            return {
                            code: InventoryErrorCodes.UNKNOWN,
                            message: `Unknown inventory error: ${decodedError.name}`,
                            details: decodedError
                        };
                    }
                }
            } catch (decodeError) {
                console.debug('Error decoding inventory error:', decodeError);
            }
        }

        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('inventory full')) {
            return {
                code: InventoryErrorCodes.INVENTORY_FULL,
                message: InventoryErrorMessages.InventoryFull
            };
        }

        return {
            code: InventoryErrorCodes.UNKNOWN,
            message: error.message || InventoryErrorMessages.Unknown,
            details: error
        };

    } catch (parseError) {
        console.error('Error parsing inventory error:', parseError);
        return {
            code: InventoryErrorCodes.UNKNOWN,
            message: InventoryErrorMessages.Unknown,
            details: { parseError, originalError: error }
        };
    }
}
