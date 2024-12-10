import { fetchUserNFTs, filterNFTs, SimpleNFT } from '../nft/nft-fetching';
import { SHAPE_XP_NFT_ADDRESS } from '../../contracts/addresses';
import { convertTokenId } from '../../utils/token-utils';
import { addNFTToInventory } from '../inventory/inventory-actions';
import { ConfigManager } from './ConfigManager';
import { UI, INVENTORY } from '../../constants';

export class ConfigNFTManager {
    private readonly gridContainerId = 'configNFTGrid';
    private nfts: SimpleNFT[] = [];
    private configManager: ConfigManager;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
        this.initializeNFTGrid();
    }

    public async refreshNFTGrid() {
        await this.initializeNFTGrid();
    }

    private async initializeNFTGrid() {
        try {
            console.log('Fetching NFTs for config page...');
            const allNFTs = await fetchUserNFTs();
            this.nfts = filterNFTs(allNFTs, [SHAPE_XP_NFT_ADDRESS.toLowerCase()]);
            await this.renderNFTGrid();
        } catch (error) {
            console.log('Error fetching NFTs for config:', error);
        }
    }

    private createNFTElement(nft: SimpleNFT): HTMLElement {
        const container = document.createElement('div');
        container.className = UI.CLASSES.NFT_GRID_CELL;;
        container.dataset.contractAddress = nft.contractAddress;
        container.dataset.tokenId = nft.tokenId;

        // Add image if available
        if (nft.imageUrl) {
            const img = document.createElement('img');
            img.src = nft.imageUrl;
            img.alt = nft.name;
            img.className = 'w-full h-full object-cover';
            img.onerror = () => {
                img.src = UI.IMAGES.PLACEHOLDER;
            };
            container.appendChild(img);
        }

        container.addEventListener('click', async () => {
            await this.handleNFTSelection(nft);
        });

        return container;
    }

    private async handleNFTSelection(nft: SimpleNFT) {
        try {
            console.log('Selected NFT:', nft);

            // Convert hex token ID to decimal
            const convertedTokenId = convertTokenId(nft.tokenId);
            console.log('Converted token ID:', convertedTokenId);

            // Try to add NFT to inventory
            const result = await addNFTToInventory(nft.contractAddress, convertedTokenId);

            if (result.success) {
                console.log('Successfully added NFT to inventory');
                await this.configManager.refreshAll();
            } else {
                console.log('Failed to add NFT to inventory:', result.error);
            }

        } catch (error) {
            console.log('Error handling NFT selection:', error);
        }
    }

    private async renderNFTGrid() {
        const gridContainer = document.getElementById(this.gridContainerId);
        if (!gridContainer) return;

        // Clear existing content
        gridContainer.innerHTML = '';

        // Create row containers (6 rows, 2 NFTs each)
        for (let i = 0; i < INVENTORY.NFT_GRID.ROWS; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = `flex gap-[${INVENTORY.NFT_GRID.GAP}px]`;

            // Add two NFT slots per row
            for (let j = 0; j < INVENTORY.NFT_GRID.COLS; j++) {
                const nftIndex = i * INVENTORY.NFT_GRID.COLS + j;
                if (nftIndex < this.nfts.length) {
                    rowDiv.appendChild(this.createNFTElement(this.nfts[nftIndex]));
                } else {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = UI.CLASSES.NFT_GRID_CELL;
                    rowDiv.appendChild(emptySlot);
                }
            }

            gridContainer.appendChild(rowDiv);
        }
    }
}
