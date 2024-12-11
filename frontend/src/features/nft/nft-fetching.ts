import { getCurrentAddress } from '../../utils/provider';
import { NETWORKS } from '../../network/network-config';
import { convertTokenId } from '../../utils/token-utils';
import { UI } from '../../constants/index';

/**
 * Interface for minimal NFT data
 */
export interface SimpleNFT {
    contractAddress: string;
    tokenId: string;
    name: string;
    imageUrl: string;
}

export const NFT_CONTAINER_CLASSES = {
    BASE: 'w-[66px] h-[66px] border-2 border-white rounded-lg',
    INTERACTIVE: 'hover:scale-105 hover:opacity-90 transition-transform transition-opacity duration-200',
    IMAGE: 'w-full h-full object-cover rounded-lg'
} as const;

/**
 * Fetches all NFTs owned by the connected wallet
 */
export async function fetchUserNFTs(): Promise<SimpleNFT[]> {
    try {
        const userAddress = await getCurrentAddress();
        const baseURL = NETWORKS.SHAPE_SEPOLIA.rpcUrl + import.meta.env.VITE_ALCHEMY_API_KEY;
        const endpoint = `${baseURL}/getNFTs/?owner=${userAddress}`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Process NFTs with only required data
        const processedNFTs: SimpleNFT[] = (data.ownedNfts || []).map((nft: any) => {
            let imageUrl = nft.metadata?.image || '';

            // Convert IPFS URLs to HTTP gateway URLs
            if (imageUrl.startsWith('ipfs://')) {
                imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            return {
                contractAddress: nft.contract?.address || '',
                tokenId: nft.id?.tokenId || '',
                name: nft.metadata?.name || nft.contract?.name || 'Unnamed NFT',
                imageUrl: imageUrl || '/placeholder-image.png' // Add a placeholder image path
            };
        });

        return processedNFTs;

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch NFTs: ${error.message}`);
        }
        throw new Error('Failed to fetch NFTs. Please try again.');
    }
}

/**
 * Filters out specific NFTs by contract address
 */
export function filterNFTs(nfts: SimpleNFT[], excludeAddresses: string[]): SimpleNFT[] {
    return nfts.filter(nft =>
        !excludeAddresses.includes(nft.contractAddress.toLowerCase())
    );
}

export function createNFTElement(nft: SimpleNFT): HTMLElement {
    const container = document.createElement('div');
    // Combine base classes with interactive classes for containers with NFTs
    container.className = `${UI.CLASSES.NFT_GRID.CELL.BASE} ${UI.CLASSES.NFT_GRID.CELL.INTERACTIVE}`;

    container.dataset.contractAddress = nft.contractAddress;
    container.dataset.tokenId = nft.tokenId;

    if (nft.imageUrl) {
        const img = document.createElement('img');
        img.src = nft.imageUrl;
        img.alt = nft.name;
        img.className = UI.CLASSES.NFT_GRID.CELL.IMAGE;
        img.onerror = () => {
            img.src = UI.IMAGES.PLACEHOLDER;
        };
        container.appendChild(img);
    }

    return container;
}
