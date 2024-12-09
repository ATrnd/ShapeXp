import { getCurrentAddress } from '../../utils/provider';
import { NETWORKS } from '../../network/network-config';
import { convertTokenId } from '../../utils/token-utils';

/**
 * Interface for minimal NFT data
 */
export interface SimpleNFT {
    contractAddress: string;
    tokenId: string;
    name: string;
    imageUrl: string;
}

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
    const div = document.createElement('div');
    div.className = 'nft-item';

    // Add all necessary data attributes
    div.dataset.contractAddress = nft.contractAddress;
    div.dataset.tokenId = nft.tokenId;
    div.dataset.convertedTokenId = convertTokenId(nft.tokenId);

    // Create HTML content with add to inventory button
    div.innerHTML = `
        <img
            src="${nft.imageUrl}"
            alt="${nft.name}"
            class="nft-image"
            onerror="this.src='/placeholder-image.png'"
        />
        <p class="nft-name">${nft.name}</p>
        <button class="add-to-inventory-btn">Add to Inventory</button>
        <p class="add-status"></p>
    `;

    return div;
}

