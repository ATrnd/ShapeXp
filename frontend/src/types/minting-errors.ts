/**
 * @title Minting Error Types
 * @notice Type definitions for ShapeXp NFT minting errors
 * @dev Includes interfaces and constant definitions for error handling
 */

/**
 * @notice Interface for AlreadyMinted error data
 * @dev Contains minter address from error payload
 */
export interface AlreadyMintedError {
    minter: string;
}

/**
 * @notice Error signature constants for ShapeXp NFT errors
 * @dev Used for error parsing and identification
 */
export const ShapeXpNFTErrorSignatures = {
    AlreadyMinted: "ShapeXpNFT__AlreadyMinted(address)",
    TransfersNotAllowed: "ShapeXpNFT__TransfersNotAllowed()",
    ApprovalNotAllowed: "ShapeXpNFT__ApprovalNotAllowed()"
} as const;

/**
 * @notice Human-readable error messages
 * @dev Maps error types to user-friendly messages
 */
export const ShapeXpNFTErrorMessages = {
    AlreadyMinted: (address: string) => `Address ${address} has already minted a ShapeXp NFT`,
    TransfersNotAllowed: "ShapeXp NFTs are soulbound and cannot be transferred",
    ApprovalNotAllowed: "ShapeXp NFTs cannot be approved for transfer",
    UserRejected: "User rejected the minting transaction",
    Unknown: "An unknown error occurred while minting"
} as const;
