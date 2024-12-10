// src/constants/experience.ts
export const EXPERIENCE = {
    MAX_AMOUNT: 100000,  // Matches the smart contract's MAX_EXPERIENCE
    TRANSFER_AMOUNT: 500, // Amount transferred between global and NFT
    MAX_ADDITION_PER_TURN: 500, // Maximum experience that can be added per turn
    COOLDOWN_PERIOD: 1800, // 30 minutes in seconds
    TYPES: {
        LOW: 0,
        MID: 1,
        HIGH: 2
    },
    VALUES: {
        LOW: 1000,  // Experience gained for LOW type
        MID: 2500,  // Experience gained for MID type
        HIGH: 5000  // Experience gained for HIGH type
    }
} as const;
