/**
* @title Inventory Error Type Definitions
* @notice Defines error types and messages for inventory operations
* @dev Contains error interfaces, signatures, codes and messages
* @custom:module-hierarchy Core Inventory Types Component
*/

/**
* @notice Inventory error details interface
* @dev Core structure for inventory operation errors
* @custom:fields
* - code: Unique error identifier
* - message: Human readable error description
* - details: Optional additional error data
*/
export interface InventoryErrorDetails {
    code: string;
    message: string;
    details?: any;
}

/**
* @notice Inventory error signature definitions
* @dev Maps error names to their Solidity signatures
* @custom:errors
* - Contract validation errors
* - Inventory state errors
* - Ownership validation errors
* - NFT validation errors
*/
export const InventoryErrorSignatures = {
    InvalidERC721Contract: "ShapeXpInvExp__InvalidERC721Contract()",
    InventoryFull: "ShapeXpInvExp__InventoryFull()",
    NFTAlreadyInInventory: "ShapeXpInvExp__NFTAlreadyInInventory()",
    NFTNotInInventory: "ShapeXpInvExp__NFTNotInInventory()",
    NotInInventory: "ShapeXpInvExp__NotInInventory()",
    NotNFTOwner: "ShapeXpInvExp__NotNFTOwner()"
} as const;

/**
* @notice Inventory error code constants
* @dev Standardized codes for error identification
* @custom:categories
* - Contract validation
* - State validation
* - Ownership checks
* - User actions
* - System operations
*/
export const InventoryErrorCodes = {
    INVALID_CONTRACT: 'INV_INVALID_CONTRACT',
    INVENTORY_FULL: 'INV_FULL',
    NFT_ALREADY_IN_INVENTORY: 'INV_NFT_ALREADY_EXISTS',
    NFT_NOT_IN_INVENTORY: 'INV_NFT_NOT_FOUND',
    NOT_IN_INVENTORY: 'INV_ITEM_NOT_FOUND',
    NOT_NFT_OWNER: 'INV_NOT_OWNER',
    USER_REJECTED: 'INV_USER_REJECTED',
    UNKNOWN: 'INV_UNKNOWN_ERROR',
    REMOVAL_NOT_SHAPEXP_OWNER: 'INV_REM_NOT_SHAPEXP_OWNER',
    REMOVAL_NOT_NFT_OWNER: 'INV_REM_NOT_NFT_OWNER',
    REMOVAL_NFT_NOT_FOUND: 'INV_REM_NFT_NOT_FOUND',
} as const;

/**
* @notice Human-readable error messages
* @dev Maps error types to user-friendly messages
* @custom:messages
* - Contract validation messages
* - State validation messages
* - Ownership requirement messages
* - User action messages
* - System error messages
*/
export const InventoryErrorMessages = {
    InvalidERC721Contract: "Invalid ERC721 contract address provided",
    InventoryFull: "Inventory is at maximum capacity (3 slots)",
    NFTAlreadyInInventory: "This NFT is already in your inventory",
    NFTNotInInventory: "This NFT is not in your inventory",
    NotInInventory: "The requested item is not in inventory",
    NotNFTOwner: "You don't own this NFT",
    UserRejected: "Transaction was rejected by user",
    Unknown: "An unknown inventory error occurred",
    RemovalNotShapeXpOwner: "ShapeXp NFT required to remove from inventory",
    RemovalNotNFTOwner: "You don't own this NFT",
    RemovalNFTNotFound: "NFT not found in inventory",
} as const;
