// src/features/nft/inventory.ts
import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';

export const INVENTORY = {
    EMPTY_ADDRESS: "0x0000000000000000000000000000000000000000",
    MAX_SLOTS: 3
} as const;

export interface InventorySlot {
    nftContract: string;
    tokenId: string;
    isEmpty: boolean;
    metadata?: {
        name?: string;
        imageUrl?: string;
    };
}

export interface InventoryData {
    slots: InventorySlot[];
    totalSlots: number;
}

export async function fetchInventory(address: string): Promise<InventoryData> {
    try {
        const contract = await getShapeXpContract();
        const [nftContracts, tokenIds] = await contract.viewInventory(address);

        const slots: InventorySlot[] = await Promise.all(
            nftContracts.map(async (contract: string, index: number) => {
                const isEmpty = contract === INVENTORY.EMPTY_ADDRESS;
                return {
                    nftContract: contract,
                    tokenId: tokenIds[index].toString(),
                    isEmpty
                };
            })
        );

        return {
            slots,
            totalSlots: INVENTORY.MAX_SLOTS
        };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}
