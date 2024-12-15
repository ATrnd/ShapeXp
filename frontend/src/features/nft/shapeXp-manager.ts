/**
* @title ShapeXp NFT Manager
* @notice Manages ShapeXp NFT minting and ownership verification
* @dev Handles the complete NFT minting lifecycle and state management
* @custom:module-hierarchy Core NFT Management Component
*/

import { AppState } from '../../state/state-store';
import { checkShapeXpNFTOwnership } from './validation';
import { ButtonState } from '../../types/button-states';
import { getGlobalExperience } from '../experience/experience-tracking';
import { mintShapeXpNFT } from './minting';
import { ButtonClasses } from '../../state/button-classes';
import { getShapeXpNFTContract } from '../../contracts/contract-instances';

/**
* @notice Manages ShapeXp NFT minting and ownership status
* @dev Implements singleton pattern via AppState dependency
* @custom:ui-elements
* - Mint button
* - Experience display
* - Ownership status indicators
*/
export class ShapeXpManager {
    private appState: AppState;
    private readonly MINT_BUTTON_ID = 'ShapeXpSandboxMint';
    private isMinting: boolean = false;

   /**
    * @notice Initializes the NFT manager
    * @dev Sets up mint button handler and initial state
    */
    constructor() {
        this.appState = AppState.getInstance();
        this.setupMintButtonHandler();
    }

   /**
    * @notice Sets up the mint button click handler
    * @dev Implements double-mint protection and state management
    * @custom:error-handling
    * - Prevents multiple simultaneous mints
    * - Handles already minted state
    */
    private setupMintButtonHandler() {
        const mintButton = document.getElementById(this.MINT_BUTTON_ID);
        if (!mintButton) return;

        mintButton.addEventListener('click', async () => {
            if (this.appState.getHasNFT()) {
                console.log('already minted, minting disabled');
                return;
            }

            if (this.isMinting) {
                console.log('Minting already in progress');
                return;
            }

            try {
                await this.handleMint();
            } catch (error) {
                console.error('Error in mint process:', error);
                this.appState.updateMintButtonState(ButtonState.DEFAULT);
            }
        });
    }

   /**
    * @notice Handles the complete NFT minting process
    * @dev Manages gas estimation, transaction, and state updates
    * @return Promise<ContractTransaction> The mint transaction
    * @custom:flow
    * 1. Get contract instance
    * 2. Estimate gas (with 20% buffer)
    * 3. Send mint transaction
    * 4. Wait for confirmation
    * 5. Verify ownership
    * 6. Update UI state
    * @custom:gas-handling
    * - Estimates gas dynamically
    * - Adds 20% buffer for safety
    * @custom:error-handling
    * - Contract interaction failures
    * - Transaction errors
    * - State update failures
    */
    private async handleMint() {
        this.isMinting = true;
        this.appState.updateMintButtonState(ButtonState.MINTING);

        try {
            console.log('1. Initiating mint process...');
            const result = await mintShapeXpNFT();

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to mint ShapeXp NFT');
            }

            console.log('2. Transaction confirmed:', result.tx?.hash);

            // Add delay to allow chain state to update
            console.log('3. Waiting for chain state update...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('4. Checking ownership...');
            await this.checkShapeXpOwnership();

            console.log('5. Setting minted state...');
            this.appState.updateMintButtonState(ButtonState.MINTED);

        } catch (error: any) {
            console.error('Minting error:', {
                message: error.message,
                code: error.code,
                data: error.data,
                transaction: error.transaction,
                stack: error.stack
            });
            this.appState.updateMintButtonState(ButtonState.DEFAULT);
            throw error;
        } finally {
            this.isMinting = false;
        }
    }

   /**
    * @notice Verifies ShapeXp NFT ownership and updates related states
    * @dev Checks ownership and updates experience display if owned
    * @custom:flow
    * 1. Check NFT ownership
    * 2. Update NFT status
    * 3. Fetch and update experience if owned
    * 4. Reset display if not owned
    * @custom:state-updates
    * - NFT ownership status
    * - Experience amount
    * - Button states
    */
    public async checkShapeXpOwnership() {
        try {
            const hasNFT = await checkShapeXpNFTOwnership();
            this.appState.updateNFTStatus(hasNFT);

            if (hasNFT) {
                const { experience, formattedExperience } = await getGlobalExperience();
                this.appState.updateExperience(experience, formattedExperience);
                this.updateExperienceDisplay(formattedExperience);
                this.appState.updateMintButtonState(ButtonState.MINTED);
            } else {
                this.updateExperienceDisplay('0');
                this.appState.updateMintButtonState(ButtonState.DEFAULT);
            }
        } catch (error) {
            console.error('Error in NFT check:', error);
            this.appState.updateNFTStatus(false);
            this.updateExperienceDisplay('0');
            this.appState.updateMintButtonState(ButtonState.DEFAULT);
        }
    }

   /**
    * @notice Updates the experience display in the UI
    * @dev Updates DOM element with formatted experience amount
    * @param amount Formatted experience amount string
    */
    private updateExperienceDisplay(amount: string) {
        const expElement = document.getElementById('ShapeXpAmount');
        if (expElement) {
            expElement.textContent = `shapexp: ${amount}`;
        }
    }
}
