// src/constants/logging.ts
export enum LogType {
    EXPERIENCE = 'experience',
    NFT = 'nft',
    NFT_EXPERIENCE = 'nftExperience',
    NFT_REMOVE = 'nftRemove',
    MINT = 'mint',
    CONNECTION = 'connection'
}

type LogMessage = {
    ADDING: string;
    ADDED: string;
    FAILED: string;
}

type LogMessages = {
    [key in LogType]: LogMessage;
}

export const LOGS = {
    MESSAGES: {
        [LogType.EXPERIENCE]: {
            ADDING: 'Adding experience...',
            ADDED: 'Experience added successfully!',
            FAILED: 'Failed to add experience'
        },
        [LogType.NFT]: {
            ADDING: 'Adding NFT to ShapeXp inventory...',
            ADDED: 'NFT added successfully!',
            FAILED: 'Failed to add NFT'
        },
        [LogType.NFT_EXPERIENCE]: {
            ADDING: 'Adding ShapeXp...',
            ADDED: 'ShapeXp added successfully!',
            FAILED: 'Failed to add ShapeXp'
        },
        [LogType.NFT_REMOVE]: {
            ADDING: 'Removing NFT from inventory...',
            ADDED: 'NFT removal completed!',
            FAILED: 'Failed to remove NFT'
        },
        [LogType.MINT]: {
            ADDING: 'Minting ShapeXp...',
            ADDED: 'ShapeXp minting completed!',
            FAILED: 'Failed to mint ShapeXp'
        },
        [LogType.CONNECTION]: {
            ADDING: 'Connecting...',
            ADDED: 'Connected',
            FAILED: 'Disconnected'
        }
    } as LogMessages,
    ELEMENTS: {
        WRAP: 'ShapeXpLogWrap',
        INFO: 'ShapeXpLogNfo',
        LOADING: 'ShapeXpLoading'
    }
} as const;
