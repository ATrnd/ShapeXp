// src/constants/network.ts
// export const NETWORK = {
//     SHAPE_SEPOLIA: {
//         CHAIN_ID: 11011,
//         NAME: 'Shape Sepolia',
//         RPC_URL: 'https://shape-sepolia.g.alchemy.com/v2/'
//     }
// } as const;

export const NETWORK = {
    SHAPE_SEPOLIA: {
        CHAIN_ID: 11011,
        NAME: 'Shape Sepolia',
        RPC_URL: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://shape-sepolia.g.alchemy.com/v2/'
    }
} as const;
