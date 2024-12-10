// src/features/experience-transfer.ts
import { EXPERIENCE } from '../../constants';

export interface ExperienceState {
    globalExperience: number;
    slotExperiences: Map<string, number>;
    blockchainExperiences: Map<string, number>;
    pendingAdditions: Map<string, number>;
}

// Helper function to get unique slot identifier
export function getSlotId(contractAddress: string, tokenId: string): string {
    return `${contractAddress}-${tokenId}`;
}

// Main experience manager class
export class ExperienceManager {
    private state: ExperienceState;

    constructor(initialGlobalExp: number) {
        this.state = {
            globalExperience: initialGlobalExp,
            slotExperiences: new Map(),
            blockchainExperiences: new Map(),
            pendingAdditions: new Map()
        };
    }

    // Initialize slot experience
    public initializeSlot(
        contractAddress: string,
        tokenId: string,
        blockchainExp: number,
        currentExp: number = blockchainExp
    ) {
        const slotId = getSlotId(contractAddress, tokenId);
        this.state.blockchainExperiences.set(slotId, blockchainExp);
        this.state.slotExperiences.set(slotId, currentExp);
        this.state.pendingAdditions.set(slotId, 0);
    }

    // Add experience to slot
    public addExperienceToSlot(contractAddress: string, tokenId: string): boolean {
        if (this.state.globalExperience < EXPERIENCE.TRANSFER_AMOUNT) {
            return false;
        }

        const slotId = getSlotId(contractAddress, tokenId);
        const pendingAddition = this.state.pendingAdditions.get(slotId) || 0;

        // Check if we've reached the addition limit
       if (pendingAddition >= EXPERIENCE.MAX_ADDITION_PER_TURN) {
            return false;
        }

        const currentExp = this.state.slotExperiences.get(slotId) || 0;

        // Update state
        this.state.globalExperience -= EXPERIENCE.TRANSFER_AMOUNT;
        this.state.slotExperiences.set(slotId, currentExp + EXPERIENCE.TRANSFER_AMOUNT);
        this.state.pendingAdditions.set(slotId, pendingAddition + EXPERIENCE.TRANSFER_AMOUNT);

        return true;
    }

    // Subtract experience from slot
    public subtractExperienceFromSlot(contractAddress: string, tokenId: string): boolean {
        const slotId = getSlotId(contractAddress, tokenId);
        const currentExp = this.state.slotExperiences.get(slotId) || 0;
        const blockchainExp = this.state.blockchainExperiences.get(slotId) || 0;

        // Can't subtract below blockchain experience amount
        if (currentExp <= blockchainExp || currentExp < EXPERIENCE.TRANSFER_AMOUNT) {
            return false;
        }

        // Update state
        this.state.globalExperience += EXPERIENCE.TRANSFER_AMOUNT;
        this.state.slotExperiences.set(slotId, currentExp - EXPERIENCE.TRANSFER_AMOUNT);

        // Update pending additions
        const pendingAddition = this.state.pendingAdditions.get(slotId) || 0;
        this.state.pendingAdditions.set(
            slotId,
            Math.max(0, pendingAddition - EXPERIENCE.TRANSFER_AMOUNT)
        );

        return true;
    }

      public getGlobalExperience(): number {
            return this.state.globalExperience;
        }

        public getSlotExperience(contractAddress: string, tokenId: string): number {
            const slotId = getSlotId(contractAddress, tokenId);
            return this.state.slotExperiences.get(slotId) || 0;
        }

        public getBlockchainExperience(contractAddress: string, tokenId: string): number {
            const slotId = getSlotId(contractAddress, tokenId);
            return this.state.blockchainExperiences.get(slotId) || 0;
        }

        public getPendingAddition(contractAddress: string, tokenId: string): number {
            const slotId = getSlotId(contractAddress, tokenId);
            return this.state.pendingAdditions.get(slotId) || 0;
        }

        public resetPendingAdditions(contractAddress: string, tokenId: string) {
            const slotId = getSlotId(contractAddress, tokenId);
            this.state.pendingAdditions.set(slotId, 0);
        }
}

