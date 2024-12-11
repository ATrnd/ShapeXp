// src/constants/logging.ts
export const LOGS = {
    MESSAGES: {
        CONNECTED: 'Connected',
        DISCONNECTED: 'Disconnected',
        CONNECTING: 'Connecting...',

        // shapexp-related messages
        MINT_STARTING: 'Minting ShapeXp...',
        MINT_COMPLETED: 'ShapeXp minting completed!',
        MINT_FAILED: 'Failed to mint ShapeXp',

        // Experience-related messages
        EXPERIENCE_ADDING: 'Adding experience...',
        EXPERIENCE_ADDED: 'Experience added successfully!',
        EXPERIENCE_FAILED: 'Failed to add experience',

        // NFT-related messages
        NFT_ADDING: 'Adding NFT...',
        NFT_ADDED: 'NFT added successfully!',
        NFT_FAILED: 'Failed to add NFT',

        // NFT Experience-related messages
        NFT_EXP_ADDING: 'Adding ShapeXp...',
        NFT_EXP_ADDED: 'ShapeXp added successfully!',
        NFT_EXP_FAILED: 'Failed to add ShapeXp',

        // NFT Removal messages
        NFT_REMOVING: 'Removing NFT from inventory...',
        NFT_REMOVED: 'NFT removal completed!',
        NFT_REMOVE_FAILED: 'Failed to remove NFT'

    },
    ELEMENTS: {
        WRAP: 'ShapeXpLogWrap',
        INFO: 'ShapeXpLogNfo',
        LOADING: 'ShapeXpLoading'
    }
} as const;
