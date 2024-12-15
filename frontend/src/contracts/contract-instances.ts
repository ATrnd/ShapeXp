/**
* @title Smart Contract Instance Management
* @notice Manages instantiation of ShapeXp smart contract interfaces
* @dev Provides factory functions for contract instances using ethers.js
* @custom:module-hierarchy Core Contract Management Component
*/

import { Contract } from 'ethers';
import { SHAPE_XP_INV_EXP_ABI } from './abis';
import { SHAPE_XP_INV_EXP_ADDRESS } from './addresses';
import { SHAPE_XP_NFT_ABI } from './abis';
import { SHAPE_XP_NFT_ADDRESS } from './addresses';
import { getSigner } from '../utils/provider';

/**
* @notice Creates ShapeXp NFT contract instance
* @dev Initializes contract with current signer
* @return Promise<Contract> Initialized ShapeXp NFT contract instance
* @custom:requires
* - Active wallet connection
* - Valid signer
* @custom:errors
* - Provider not found
* - Invalid signer
* - Contract initialization failure
* @custom:address SHAPE_XP_NFT_ADDRESS
* @custom:abi SHAPE_XP_NFT_ABI
*/
export async function getShapeXpNFTContract() {
    const signer = await getSigner();
    const contract = new Contract(
        SHAPE_XP_NFT_ADDRESS,
        SHAPE_XP_NFT_ABI,
        signer
    );
    return contract;
}

/**
* @notice Creates ShapeXp Experience contract instance
* @dev Initializes contract with current signer
* @return Promise<Contract> Initialized ShapeXp Experience contract instance
* @custom:requires
* - Active wallet connection
* - Valid signer
* - ShapeXp NFT ownership for most operations
* @custom:errors
* - Provider not found
* - Invalid signer
* - Contract initialization failure
* @custom:address SHAPE_XP_INV_EXP_ADDRESS
* @custom:abi SHAPE_XP_INV_EXP_ABI
*/
export async function getShapeXpContract() {
    const signer = await getSigner();
    return new Contract(
        SHAPE_XP_INV_EXP_ADDRESS,
        SHAPE_XP_INV_EXP_ABI,
        signer
    );
}
