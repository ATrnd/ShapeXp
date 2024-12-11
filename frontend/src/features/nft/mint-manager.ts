// features/nft/mint-manager.ts
import { mintShapeXpNFT } from './minting';
import { LogManager } from '../../utils/log-manager';
import { LogType } from '../../constants';
import { AppState } from '../../state/state-store';

export class MintManager {
    private logManager: LogManager;
    private appState: AppState;

    constructor() {
        console.log('Initializing MintManager');
        this.logManager = LogManager.getInstance();
        this.appState = AppState.getInstance();
        this.initializeMintButton();
    }

    private async initializeMintButton() {
        const mintButton = document.getElementById('ShapeXpMintButton') as HTMLButtonElement;
        if (!mintButton) {
            console.log('Mint button not found');
            return;
        }

        mintButton.addEventListener('click', async () => {
            try {
                // Update UI state
                this.appState.updateMintingState(true);
                this.logManager.showStarting(LogType.MINT);

                // Perform minting
                const tx = await mintShapeXpNFT();
                console.log('Mint transaction sent:', tx.hash);

                // Wait for confirmation
                await tx.wait();
                console.log('Mint transaction confirmed!');

                // Update states
                this.appState.updateNFTStatus(true);
                this.appState.updateMintingState(false);
                this.logManager.showSuccess(LogType.MINT);

                // Change page
                this.appState.setCurrentPage('access');

            } catch (error: any) {
                console.log('Minting error:', error);
                this.appState.updateMintingState(false, error.message);
                this.logManager.showError(LogType.MINT, error.message);
            }
        });
    }
}
