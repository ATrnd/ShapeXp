import { fetchInventory } from './inventory-management';

interface InventorySlot {
    nftContract: string;
    tokenId: string;
    isEmpty: boolean;
    metadata?: {
        name?: string;
        imageUrl?: string;
    };
    experience?: string;
}

export class ConfigInventoryManager {
    private readonly SLOT_COUNT = 3;
    private slots: InventorySlot[] = [];

    constructor() {
        this.initializeInventory();
    }

    private async initializeInventory() {
        try {
            console.log('Fetching inventory...');
            const inventory = await fetchInventory();
            this.slots = inventory.slots;
            this.updateInventoryDisplay();
        } catch (error) {
            console.log('Error fetching inventory:', error);
        }
    }

    private updateInventoryDisplay() {
        for (let i = 1; i <= this.SLOT_COUNT; i++) {
            const section = document.getElementById(`ShapeXpInvSection${i}`);
            const slot = document.getElementById(`ShapeXpInv${i}`);
            const xpDisplay = document.getElementById(`ShapeXpInvXP${i}`);

            if (section && slot && xpDisplay) {
                const inventorySlot = this.slots[i - 1];

                if (inventorySlot && !inventorySlot.isEmpty) {
                    // Populated slot
                    section.classList.remove('opacity-50');

                    // Update image
                    slot.innerHTML = inventorySlot.metadata?.imageUrl ?
                        `<img src="${inventorySlot.metadata.imageUrl}"
                              alt="${inventorySlot.metadata.name || 'NFT'}"
                              class="w-full h-full object-cover">` : '';

                    // Update XP
                    xpDisplay.textContent = `shapexp:${inventorySlot.experience || '0'}`;

                    // Store NFT data
                    slot.dataset.contractAddress = inventorySlot.nftContract;
                    slot.dataset.tokenId = inventorySlot.tokenId;
                } else {
                    // Empty slot
                    section.classList.add('opacity-50');
                    slot.innerHTML = '';
                    xpDisplay.textContent = 'shapexp:0';
                    delete slot.dataset.contractAddress;
                    delete slot.dataset.tokenId;
                }
            }
        }
    }

    public async refreshInventory() {
        await this.initializeInventory();
    }
}
