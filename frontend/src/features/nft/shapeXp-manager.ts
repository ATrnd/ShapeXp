// src/features/nft/nft-manager.ts
import { AppState } from '../../state/state-store';
import { checkShapeXpNFTOwnership } from './validation';
import { LogManager } from '../../utils/log-manager';
import { LogType } from '../../constants/logging';

export class ShapeXpManager {
    private appState: AppState;
    private logManager: LogManager;

    constructor() {
        this.appState = AppState.getInstance();
        this.logManager = LogManager.getInstance();
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
