// src/constants/inventory.ts
export const INVENTORY = {
    MAX_SLOTS: 3,
    EMPTY_ADDRESS: '0x0000000000000000000000000000000000000000',
    NFT_GRID: {
        ROWS: 6,
        COLS: 2,
        CELL_SIZE: 66, // in pixels
        GAP: 25 // in pixels
    }
} as const;
