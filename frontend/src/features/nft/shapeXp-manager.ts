// src/features/nft/shapeXp-manager.ts
import { AppState } from '../../state/state-store';
import { checkShapeXpNFTOwnership } from './validation';

export class ShapeXpManager {
    private appState: AppState;

    constructor() {
        this.appState = AppState.getInstance();
        this.initializeMintButton();
    }

    private initializeMintButton() {
        const mintButton = document.getElementById('ShapeXpMintButton');
        if (!mintButton) return;

        mintButton.addEventListener('click', () => {
            console.log('Mint button clicked');
        });
    }

    public async checkShapeXpOwnership() {
        try {
            const hasNFT = await checkShapeXpNFTOwnership();
            this.appState.updateNFTStatus(hasNFT);
        } catch (error) {
            console.error('Error in NFT check:', error);
            this.appState.updateNFTStatus(false);
        }
    }
}
