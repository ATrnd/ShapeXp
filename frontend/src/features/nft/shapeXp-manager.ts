// src/features/nft/shapeXp-manager.ts
import { AppState } from '../../state/state-store';
import { checkShapeXpNFTOwnership } from './validation';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';
import { LogManager } from '../../utils/log-manager';
import { ExperienceManager } from '../../state/state-store';

export class ShapeXpManager {
    private appState: AppState;
    private logManager: LogManager;
    private experienceManager: ExperienceManager;
    private isMinting: boolean = false;

    constructor() {
        this.appState = AppState.getInstance();
        this.logManager = LogManager.getInstance();
        this.experienceManager = new ExperienceManager();
        this.initializeMintButton();
    }

    private initializeMintButton() {
        const mintButton = document.getElementById('ShapeXpMintButton');
        if (!mintButton) return;

        mintButton.addEventListener('click', async () => {
            try {
                await this.handleMint();
            } catch (error) {
                console.error('Error in mint process:', error);
            }
        });
    }

    private async handleMint() {
        if (this.isMinting) {
            console.log('Minting already in progress');
            return;
        }
        try {
            this.isMinting = true;
            this.updateMintButtonState(true);
            this.logManager.updateMintStatus('start');

            console.log('--- Initiating mint process... ---');
            const nftContract = await getShapeXpNFTContract();

            console.log('--- Calling ShapeXpNFT mint function ---');
            const tx = await nftContract.mint();
            console.log('--- Mint transaction sent: ---', tx.hash);

            console.log('--- Waiting for transaction confirmation ---');
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('--- Transaction confirmation timeout ---')), 30000);
            });

            const receipt = await Promise.race([
                tx.wait(1),
                timeoutPromise
            ]);

            console.log('--- Transaction receipt ---', receipt);

            // Update NFT ownership status after successful mint
            this.logManager.updateMintStatus('success');
            await this.checkShapeXpOwnership();

            return tx;

        } catch (error: any) {
            console.error('--- Detailed minting error ---', {
                message: error.message,
                code: error.code,
                data: error.data,
                transaction: error.transaction
            });
            this.logManager.updateMintStatus('failed');
            throw error;
        } finally {
            this.isMinting = false;
            this.updateMintButtonState(false);
        }
    }

    private updateMintButtonState(isMinting: boolean) {
        const mintButton = document.getElementById('ShapeXpMintButton');
        if (!mintButton) return;

        if (isMinting) {
            mintButton.setAttribute('disabled', 'true');
            mintButton.textContent = 'Minting...';
        } else {
            mintButton.removeAttribute('disabled');
            mintButton.textContent = 'Mint ShapeXP NFT';
        }
    }

    public async checkShapeXpOwnership() {
        try {
            const hasNFT = await checkShapeXpNFTOwnership();
            this.appState.updateNFTStatus(hasNFT);
            if (hasNFT) {
                await this.experienceManager.checkAndUpdateExperience();
            }
        } catch (error) {
            console.error('Error in NFT check:', error);
            this.appState.updateNFTStatus(false);
        }
    }
}
