// src/features/nft/nft-fetching.ts
import { NETWORK } from '../../constants/network';

export interface NFTMetadata {
    name: string;
    imageUrl: string;
    contractAddress: string;
    tokenId: string;
}

/**
 * Converts hex token ID to decimal while handling padded formats
 */
export function convertTokenId(hexTokenId: string): string {
    try {
        const cleanHex = hexTokenId.toLowerCase().replace('0x', '');
        const significantHex = cleanHex.replace(/^0+/, '');

        if (significantHex === '') {
            return '0';
        }

        return BigInt('0x' + significantHex).toString();
    } catch (error) {
        throw new Error(`Invalid token ID format: ${hexTokenId}`);
    }
}

export async function fetchUserNFTs(address: string): Promise<NFTMetadata[]> {
    try {
        // const baseURL = "https://shape-sepolia.g.alchemy.com/v2/";
        const baseURL = import.meta.env.VITE_SEPOLIA_BASE_URL;
        const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
        const endpoint = `${baseURL}${apiKey}/getNFTs?owner=${address}`;

        console.log("Fetching NFTs from endpoint:", endpoint);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch NFTs');
        }

        const data = await response.json();

        return data.ownedNfts.map((nft: any) => {
            let imageUrl = nft.metadata?.image || '';
            if (imageUrl.startsWith('ipfs://')) {
                imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            let tokenId;
            try {
                tokenId = convertTokenId(nft.tokenId || nft.id?.tokenId || '0x0');
            } catch (error) {
                console.warn(`Token ID conversion failed for NFT:`, nft);
                tokenId = nft.tokenId || 'Unknown';
            }

            return {
                name: nft.metadata?.name || nft.title || 'ShapeXp NFT',
                imageUrl,
                contractAddress: nft.contract.address,
                tokenId
            };
        });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
}
