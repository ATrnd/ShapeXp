/**
* @title NFT Data Fetching System
* @notice Manages NFT metadata retrieval and formatting
* @dev Handles NFT data fetching from Alchemy API
* @custom:module-hierarchy Core NFT Data Component
*/

import { NETWORK } from '../../constants/network';

/**
* @notice NFT metadata interface
* @dev Core structure for NFT data representation
* @custom:fields
* - name: NFT collection or item name
* - imageUrl: NFT image URI (IPFS or HTTP)
* - contractAddress: NFT contract address
* - tokenId: Unique token identifier
*/
export interface NFTMetadata {
    name: string;
    imageUrl: string;
    contractAddress: string;
    tokenId: string;
}

/**
* @notice Converts hexadecimal token IDs to decimal
* @dev Handles padded and non-padded hex formats
* @param hexTokenId The hex token ID to convert
* @return string Decimal token ID
* @custom:errors
* - Invalid hex format
* - Invalid token ID
* @custom:formats
* - Handles '0x' prefix
* - Removes leading zeros
* - Converts empty to '0'
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

/**
* @notice Fetches all NFTs owned by an address
* @dev Retrieves NFT data from Alchemy API
* @param address The owner's Ethereum address
* @return Promise<NFTMetadata[]> Array of NFT metadata
* @custom:requirements
* - Valid Ethereum address
* - Active Alchemy API key
* - Valid network configuration
* @custom:processing
* - IPFS URL conversion
* - Token ID normalization
* - Image URL formatting
* @custom:errors
* - API connection failures
* - Invalid address format
* - Rate limiting
*/
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
