// src/types/inventory-errors.ts
export interface InventoryErrorDetails {
    code: string;
    message: string;
    details?: any;
}

export const InventoryErrorSignatures = {
    InvalidERC721Contract: "ShapeXpInvExp__InvalidERC721Contract()",
    InventoryFull: "ShapeXpInvExp__InventoryFull()",
    NFTAlreadyInInventory: "ShapeXpInvExp__NFTAlreadyInInventory()",
    NFTNotInInventory: "ShapeXpInvExp__NFTNotInInventory()",
    NotInInventory: "ShapeXpInvExp__NotInInventory()",
    NotNFTOwner: "ShapeXpInvExp__NotNFTOwner()"
} as const;

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
