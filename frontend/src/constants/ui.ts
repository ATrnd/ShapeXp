// src/constants/ui.ts
export const UI = {
    TIMEOUT: {
        TRANSACTION: 30000, // 30 seconds
        NFT_FETCH: 10000,   // 10 seconds
    },
    IMAGES: {
        PLACEHOLDER: '/placeholder-image.png'
    },
    CLASSES: {
        ACTIVE: 'active',
        DISABLED: 'opacity-50 cursor-not-allowed',
        NFT_GRID_CELL: 'w-[66px] h-[66px] border-2 border-white rounded-lg'
    }
} as const;
