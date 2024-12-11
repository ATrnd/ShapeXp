// src/constants/ui.ts
export const UI = {
    TIMEOUT: {
        TRANSACTION: 30000,
        NFT_FETCH: 10000,
    },
    IMAGES: {
        PLACEHOLDER: '/placeholder-image.png'
    },
    CLASSES: {
        ACTIVE: 'active',
        DISABLED: 'opacity-50 cursor-not-allowed',
        NFT_GRID: {
            CELL: {
                BASE: 'w-[66px] h-[66px] border-2 border-white rounded-lg',
                INTERACTIVE: 'w-[66px] h-[66px] border-2 border-white rounded-lg hover:scale-105 hover:opacity-90 hover:border-[#FF7272] transition-transform transition-opacity transition-colors duration-200 cursor-pointer',
                IMAGE: 'w-full h-full object-cover rounded-lg'
            }
        }
    }
} as const;
