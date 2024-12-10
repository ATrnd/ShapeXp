import { fetchUserNFTs, filterNFTs, SimpleNFT } from '../nft/nft-fetching';
import { SHAPE_XP_NFT_ADDRESS } from '../../contracts/addresses';
import { convertTokenId } from '../../utils/token-utils';
import { addNFTToInventory } from '../inventory/inventory-actions';

export class ConfigNFTManager {
    private readonly gridContainerId = 'configNFTGrid';
    private nfts: SimpleNFT[] = [];

    constructor() {
        this.initializeNFTGrid();
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
        container.className = 'w-[66px] h-[66px] border-2 border-white rounded-lg relative overflow-hidden';
        container.dataset.contractAddress = nft.contractAddress;
        container.dataset.tokenId = nft.tokenId;

        // Add image if available
        if (nft.imageUrl) {
            const img = document.createElement('img');
            img.src = nft.imageUrl;
            img.alt = nft.name;
            img.className = 'w-full h-full object-cover';
            img.onerror = () => {
                img.src = '/placeholder-image.png';
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
        for (let i = 0; i < 6; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flex gap-[25px]';

            // Add two NFT slots per row
            for (let j = 0; j < 2; j++) {
                const nftIndex = i * 2 + j;
                if (nftIndex < this.nfts.length) {
                    // Add NFT if we have one
                    rowDiv.appendChild(this.createNFTElement(this.nfts[nftIndex]));
                } else {
                    // Add empty slot
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'w-[66px] h-[66px] border-2 border-white rounded-lg';
                    rowDiv.appendChild(emptySlot);
                }
            }

            gridContainer.appendChild(rowDiv);
        }
    }
}
