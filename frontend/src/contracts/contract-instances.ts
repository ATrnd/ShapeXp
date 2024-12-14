import { Contract } from 'ethers';
import { SHAPE_XP_INV_EXP_ABI } from './abis';
import { SHAPE_XP_INV_EXP_ADDRESS } from './addresses';
import { SHAPE_XP_NFT_ABI } from './abis';
import { SHAPE_XP_NFT_ADDRESS } from './addresses';

import { getSigner } from '../utils/provider';

export async function getShapeXpNFTContract() {
    const signer = await getSigner();
    const contract = new Contract(
        SHAPE_XP_NFT_ADDRESS,
        SHAPE_XP_NFT_ABI,
        signer
    );
    return contract;
}

export async function getShapeXpContract() {
    const signer = await getSigner();
    return new Contract(
        SHAPE_XP_INV_EXP_ADDRESS,
        SHAPE_XP_INV_EXP_ABI,
        signer
    );
}
