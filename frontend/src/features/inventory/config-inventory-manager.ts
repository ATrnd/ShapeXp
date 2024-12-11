import { fetchInventory } from './inventory-management';
import { addNFTExperience } from '../nft/nft-experience-addition';
import { getGlobalExperience } from '../experience/experience-tracking';
import { removeNFTFromInventory } from '../nft/nft-inventory-removal';
import { LogManager } from '../../utils/log-manager';

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
    private logManager: LogManager;

    constructor() {
        this.logManager = LogManager.getInstance();
        this.initializeInventory();
        this.setupExperienceControls();

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

    private setupExperienceControls() {
        for (let i = 1; i <= this.SLOT_COUNT; i++) {
            const addButton = document.getElementById(`ShapeXpInvAdd${i}`);
            const slot = document.getElementById(`ShapeXpInv${i}`);
            const removeButton = document.getElementById(`ShapeXpInvRemove${i}`);

            if (addButton && slot) {
                addButton.addEventListener('click', async () => {
                    if (slot.dataset.contractAddress && slot.dataset.tokenId) {
                        await this.handleAddExperience(
                            slot.dataset.contractAddress,
                            slot.dataset.tokenId
                        );
                    }
                });
            }

            if (removeButton && slot) {
                removeButton.addEventListener('click', async () => {
                    if (slot.dataset.contractAddress && slot.dataset.tokenId) {
                        await this.handleRemoveNFT(
                            slot.dataset.contractAddress,
                            slot.dataset.tokenId
                        );
                    }
                });
            }
        }
    }

    private async handleRemoveNFT(contractAddress: string, tokenId: string) {
        try {
            console.log('Removing NFT:', { contractAddress, tokenId });

            // Show removing state
            this.logManager.showNFTRemoving();

            const result = await removeNFTFromInventory(contractAddress, tokenId);

            if (result.success) {
                console.log('NFT removed successfully');
                this.logManager.showNFTRemoved();
                // Refresh inventory to update UI
                await this.refreshInventory();
            } else {
                console.log('Failed to remove NFT:', result.error);
                this.logManager.showNFTRemoveFailed(result.error);
            }
        } catch (error) {
            console.log('Error removing NFT:', error);
        }
    }

    private async handleAddExperience(contractAddress: string, tokenId: string) {
        try {
            console.log('Adding experience to NFT:', { contractAddress, tokenId });

            // Show adding state
            this.logManager.showNFTExperienceAdding();

            const result = await addNFTExperience(contractAddress, tokenId);

            if (result.success) {

                console.log('Experience added successfully');
                this.logManager.showNFTExperienceAdded();
                await this.refreshInventory();
                await this.updateGlobalExperience();

            } else {
                console.log('Failed to add experience:', result.error);
                this.logManager.showNFTExperienceFailed(result.error);
            }

        } catch (error) {
            console.log('Error adding experience:', error);
        }
    }

   private async updateGlobalExperience() {
        try {
            const { formattedExperience } = await getGlobalExperience();
            const xpDisplay = document.getElementById('ShapeXpConfigXpDisplay');

            if (xpDisplay) {
                xpDisplay.textContent = `xp available :: ${formattedExperience}`;
            }

            console.log('Global experience updated:', formattedExperience);
        } catch (error) {
            console.log('Error updating global experience:', error);
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
                              class="w-full h-full object-cover rounded-lg">` : '';

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
