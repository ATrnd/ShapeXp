/**
 * @title Experience Manager
 * @notice Manages the experience point system UI interactions and state
 * @dev Handles button state management, experience transactions, and UI updates
 * @custom:module-hierarchy Core Feature Component
 */

import { ButtonState, ExperienceAmount } from '../../types/button-states';
import { ButtonClasses } from '../../state/button-classes';
import { addGlobalExperience } from './experience-addition';
import { getGlobalExperience } from './experience-tracking';
import { LogManager } from '../../utils/log-manager';
import { AppState } from '../../state/state-store';
import { parseShapeXpError } from '../../utils/error-decoder.ts';
import { CooldownTimer } from '../../utils/cooldown-timer';

/**
 * @notice Manages experience point interactions and UI state
 * @dev Implements Singleton pattern via dependency injection
 * @custom:ui-elements
 * - Experience buttons (Low, Mid, High)
 * - Experience display
 * - Status indicators
 */
export class ExperienceManager {
    private appState: AppState;
    private isProcessing: boolean = false;
    private logManager: LogManager;
    private cooldownTimer: CooldownTimer;

    /**
     * @notice Button IDs for experience interaction
     * @dev Maps to HTML elements in the DOM
     */
    private readonly experienceButtons = [
        'ShapeXpSandboxXpLow',
        'ShapeXpSandboxXpMid',
        'ShapeXpSandboxXpHigh'
    ];

    /**
     * @notice Maps button IDs to their corresponding experience amounts
     * @dev Used for contract interaction mapping
     */
    private readonly experienceTypes = {
        'ShapeXpSandboxXpLow': ExperienceAmount.LOW,
        'ShapeXpSandboxXpMid': ExperienceAmount.MID,
        'ShapeXpSandboxXpHigh': ExperienceAmount.HIGH
    } as const;

    /**
     * @notice Initializes the experience manager
     * @dev Sets up singleton instances and initializes UI elements
     */
    constructor() {
        this.logManager = LogManager.getInstance();
        this.appState = AppState.getInstance();
        this.cooldownTimer = CooldownTimer.getInstance();
        this.initializeExperienceButtons();
    }

    /**
     * @notice Sets up experience button click handlers
     * @dev Attaches event listeners to each experience button
     * @custom:error-handling Prevents multiple simultaneous transactions
     */
    private initializeExperienceButtons() {
        Object.entries(this.experienceTypes).forEach(([buttonId, expType]) => {
            const button = document.getElementById(buttonId);
            if (!button) return;

            button.addEventListener('click', async () => {
                if (this.isProcessing) {
                    console.log('Experience gain already in progress');
                    return;
                }

                await this.handleExperienceAdd(buttonId, expType);
            });
        });
    }

    /**
     * @notice Disables all experience gain buttons
     * @dev Updates button states and CSS classes
     */
    private disableAllExperienceButtons() {
        this.experienceButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.setAttribute('disabled', 'true');
                button.className = ButtonClasses.getProgressClasses();
            }
        });
    }

    /**
     * @notice Re-enables all experience gain buttons
     * @dev Restores default button states and CSS classes
     */
    private enableAllExperienceButtons() {
        this.experienceButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.removeAttribute('disabled');
                button.className = ButtonClasses.getDefaultClasses();
            }
        });
    }

    /**
     * @notice Handles the experience addition process
     * @dev Manages the complete flow of adding experience points
     * @param buttonId The ID of the clicked button
     * @param expType The type of experience to add
     * @custom:flow
     * 1. Disable UI interactions
     * 2. Update UI state
     * 3. Send transaction
     * 4. Handle confirmation
     * 5. Update experience display
     * 6. Start cooldown
     * 7. Reset UI state
     * @custom:error-handling
     * - Transaction failures
     * - Contract errors
     * - Network issues
     */
    private async handleExperienceAdd(buttonId: string, expType: ExperienceAmount) {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true; // Set processing flag
            this.disableAllExperienceButtons(); // Disable all buttons

            console.log('Starting experience addition...', {  // Added
                buttonId,
                expType: ExperienceAmount[expType]
            });

            // Update UI to show progress
            this.appState.updateExperienceButtonState(buttonId, ButtonState.GAINING);
            this.logManager.updateExperienceStatus('start');

            const result = await addGlobalExperience(expType);

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to add experience');
            }

            console.log('Experience transaction sent:', result.transactionHash);

            // Show success state
            this.appState.updateExperienceButtonState(buttonId, ButtonState.GAINED);
            this.logManager.updateExperienceStatus('success');

            // Get updated experience
            const { experience, formattedExperience } = await getGlobalExperience();

            console.log('New experience amount:', formattedExperience);

            this.appState.updateExperience(experience, formattedExperience);
            this.updateExperienceDisplay(formattedExperience);
            this.cooldownTimer.startCooldown();

            // Reset to default state after delay
            setTimeout(() => {
                this.appState.updateExperienceButtonState(buttonId, ButtonState.DEFAULT);
            }, 3000);

        } catch (error: any) {
            console.error('Experience addition failed:', error);
            const readableError = parseShapeXpError(error);
            this.logManager.updateExperienceStatus('failed', readableError);

            // Reset to default state on error
            this.appState.updateExperienceButtonState(buttonId, ButtonState.DEFAULT);
        } finally {
            this.isProcessing = false; // Reset processing flag
            this.enableAllExperienceButtons(); // Re-enable all buttons
        }
    }

    /**
     * @notice Updates the experience display in the UI
     * @dev Updates the DOM element showing current experience
     * @param amount Formatted experience amount to display
     */
    private updateExperienceDisplay(amount: string) {
        const expElement = document.getElementById('ShapeXpAmount');
        if (expElement) {
            expElement.textContent = `shapexp: ${amount}`;
        }
    }
}
