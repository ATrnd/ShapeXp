import { NETWORK } from '../constants';

export const NETWORKS = {
    SHAPE_SEPOLIA: {
        rpcUrl: NETWORK.SHAPE_SEPOLIA.RPC_URL,
        name: NETWORK.SHAPE_SEPOLIA.NAME,
        chainId: NETWORK.SHAPE_SEPOLIA.CHAIN_ID
    }
} as const;
