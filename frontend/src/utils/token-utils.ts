// src/utils/token-utils.ts
import { Contract } from 'ethers';

interface TokenValidationResult {
    exists: boolean;
    error?: string;
    originalHex: string;
    decimal: string;
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

/**
 * Validates if a token ID exists on its contract
 */
export async function validateTokenId(
    contractAddress: string,
    tokenId: string,
    provider: any
): Promise<TokenValidationResult> {
    const minimalABI = [
        "function ownerOf(uint256 tokenId) view returns (address)"
    ];

    try {
        const contract = new Contract(contractAddress, minimalABI, provider);
        const decimal = convertTokenId(tokenId);

        try {
            await contract.ownerOf(decimal);
            return {
                exists: true,
                originalHex: tokenId,
                decimal: decimal
            };
        } catch (ownerError: any) {
            if (ownerError.message.includes("nonexistent token")) {
                return {
                    exists: false,
                    error: "Token does not exist",
                    originalHex: tokenId,
                    decimal: decimal
                };
            }

            return {
                exists: false,
                error: ownerError.message,
                originalHex: tokenId,
                decimal: decimal
            };
        }
    } catch (error: any) {
        return {
            exists: false,
            error: error.message,
            originalHex: tokenId,
            decimal: convertTokenId(tokenId)
        };
    }
}

/**
 * Tests token ID conversion and validation
 */
export async function testTokenIdConversion(
    contractAddress: string,
    tokenId: string,
    provider: any
): Promise<void> {
    try {
        const decimal = convertTokenId(tokenId);
        console.log('Token ID:', {
            hex: tokenId,
            decimal: decimal
        });

        const validation = await validateTokenId(contractAddress, tokenId, provider);
        if (validation.exists) {
            console.log('Token validation successful');
        } else {
            console.log('Token validation failed:', validation.error);
        }
    } catch (error) {
        throw error;
    }
}

