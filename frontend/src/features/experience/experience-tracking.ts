/**
 * @title Experience Tracking Module
 * @notice Handles fetching and formatting of user's global experience points
 * @dev Module for retrieving experience data from ShapeXp contract
 * @custom:module-hierarchy Core Feature Component
 */

import { getShapeXpContract } from '../../contracts/contract-instances';
import { getCurrentAddress } from '../../utils/provider';

/**
 * @notice Fetches and formats the global experience points for the current user
 * @dev Retrieves experience data from the ShapeXp contract and formats it for display
 * @return Promise<{
 *   experience: bigint - Raw experience value from contract
 *   formattedExperience: string - Formatted string for UI display
 * }>
 * @custom:flow
 * 1. Get contract instance
 * 2. Get current user address
 * 3. Validate contract interface
 * 4. Fetch experience data
 * 5. Format and return results
 * @custom:errors
 * - Contract interaction failures
 * - Invalid contract ABI
 * - Address resolution failures
 * @custom:logging
 * - Contract address
 * - User address
 * - Raw experience value
 * - Error details
 */
export async function getGlobalExperience(): Promise<{ experience: bigint, formattedExperience: string }> {
    try {
        // console.log('--- Fetching global experience ---');
        const contract = await getShapeXpContract();
        const userAddress = await getCurrentAddress();

        // console.log('Contract address: ', contract.target);
        // console.log('User address: ', userAddress);

        if (typeof contract.getGlobalExperience !== 'function') {
            throw new Error('getGlobalExperience function not found in contract ABI');
        }

        const experience = await contract.getGlobalExperience(userAddress);
        // console.log('Raw experience value: ', experience.toString());

        const formattedExperience = experience.toString();

        return {
            experience,
            formattedExperience
        };
    } catch (error: any) {
        console.error('Error fetching global experience:', {
            message: error.message,
            code: error.code,
            details: error
        });
        throw error;
    }
}
