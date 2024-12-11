// src/constants/logging.ts
export const LOGS = {
    MESSAGES: {
        CONNECTED: 'Connected',
        DISCONNECTED: 'Disconnected',
        CONNECTING: 'Connecting...',

        // Experience-related messages
        EXPERIENCE_ADDING: 'Adding experience...',
        EXPERIENCE_ADDED: 'Experience gained!',
        EXPERIENCE_FAILED: 'Failed to add experience',

        // NFT-related messages
        NFT_ADDING: 'Adding NFT...',
        NFT_ADDED: 'NFT added successfully!',
        NFT_FAILED: 'Failed to add NFT',

    },
    ELEMENTS: {
        WRAP: 'ShapeXpLogWrap',
        INFO: 'ShapeXpLogNfo',
        LOADING: 'ShapeXpLoading'
    }
} as const;
