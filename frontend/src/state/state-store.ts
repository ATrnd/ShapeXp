// src/state/state-store.ts
/**
 * @title Application State Management
 * @notice Central state management system for ShapeXp application
 * @dev Implements Singleton pattern for global state management
 * @custom:module-hierarchy Core State Management Component
 */

import { ButtonState } from '../types/button-states';
import { ButtonClasses } from './button-classes';

/**
 * @notice Configuration interface for button states
 * @dev Defines the structure for button state configurations
 */
interface ButtonConfig {
    id?: string;
    states: {
        [key in ButtonState]?: {
            text?: string;
            dynamicText?: (type: string) => string;
            classes: string[];
        };
    };
}

/**
 * @title Application State Controller
 * @notice Manages global application state and UI updates
 * @dev Singleton class handling all state mutations and queries
 * @custom:state-management
 * - Wallet connection state
 * - NFT ownership state
 * - Experience points
 * - Button states
 */
export class AppState {

    /**
     * @notice Core state variables
     * @dev Primary application state storage
     */
    private static instance: AppState;
    private isConnected: boolean = false;
    private userAddress: string | null = null;
    private hasNFT: boolean = false;
    private experience: bigint = BigInt(0);
    private formattedExperience: string = '0';

    private constructor() {
        this.initializeButtonStates();
    }

    /**
     * @notice Button configuration definitions
     * @dev Defines state transitions and UI updates for each button type
     * @custom:button-types
     * - Connect: Wallet connection
     * - Mint: NFT minting
     * - Experience: XP gaining
     */
    private readonly buttonConfigs: { [key: string]: ButtonConfig } = {
        connect: {
            id: 'ShapeXpSandboxConnect',
            states: {
                [ButtonState.DEFAULT]: {
                    text: 'Connect',
                    classes: [ButtonClasses.default]
                },
                [ButtonState.PROGRESS]: {
                    text: 'Connecting...',
                    classes: [ButtonClasses.progress]
                },
                [ButtonState.COMPLETED]: {
                    text: 'Connected',
                    classes: [ButtonClasses.connected, ButtonClasses.disabled]
                }
            }
        },
        mint: {
            id: 'ShapeXpSandboxMint',
            states: {
                [ButtonState.DEFAULT]: {
                    text: 'Mint ShapeXp',
                    classes: [ButtonClasses.default]
                },
                [ButtonState.MINTING]: {
                    text: 'Minting...',
                    classes: [ButtonClasses.progress]
                },
                [ButtonState.MINTED]: {
                    text: 'Minted',
                    classes: [ButtonClasses.minted, ButtonClasses.disabled]
                }
            }
        },
        experience: {
            states: {
                [ButtonState.DEFAULT]: {
                    dynamicText: (type: string) => `Gain ShapeXp (${type})`,
                    classes: [ButtonClasses.default]
                },
                [ButtonState.GAINING]: {
                    text: 'Adding ShapeXp...',
                    classes: [ButtonClasses.progress]
                },
                [ButtonState.GAINED]: {
                    text: 'ShapeXp Added!',
                    classes: [ButtonClasses.gained, ButtonClasses.disabled]
                }
            }
    }
    };

    /**
     * @notice Restricted buttons requiring NFT ownership
     * @dev Buttons that are only enabled when user owns ShapeXp NFT
     */
    private restrictedButtons = [
        'ShapeXpSandboxMint',
        'ShapeXpSandboxXpLow',
        'ShapeXpSandboxXpMid',
        'ShapeXpSandboxXpHigh',
    ];

    /**
     * @notice Updates button state and UI
     * @dev Handles button state transitions and related UI updates
     * @param buttonType Type of button to update
     * @param state New state to apply
     * @custom:state-transitions
     * - Updates button text
     * - Updates CSS classes
     * - Manages loading indicators
     * - Handles disabled states
     */
    public updateButtonState(buttonType: string, state: ButtonState) {
        const config = this.buttonConfigs[buttonType];
        if (!config || !config.id) return;

        const button = document.getElementById(config.id);
        if (!button) return;

        const loadingIndicator = button.nextElementSibling as HTMLElement;
        const stateConfig = config.states[state];

        if (stateConfig) {
            if (stateConfig.text) {
                button.textContent = stateConfig.text;
            } else if (stateConfig.dynamicText && buttonType === 'experience') {
                const buttonId = button.id;
                const type = buttonId.includes('Low') ? 'Low' : buttonId.includes('Mid') ? 'Mid' : 'High';
                button.textContent = stateConfig.dynamicText(type);
            }

            button.className = ButtonClasses.combine(...stateConfig.classes);

            if (state === ButtonState.PROGRESS) {
                button.setAttribute('disabled', 'true');
                if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            } else {
                if ([ButtonState.COMPLETED, ButtonState.MINTED, ButtonState.GAINED].includes(state)) {
                    button.setAttribute('disabled', 'true');
                } else {
                    button.removeAttribute('disabled');
                }
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
            }
        }
    }

    /**
     * @notice Updates NFT ownership status and related UI
     * @dev Manages button states based on NFT ownership
     * @param hasNFT Boolean indicating NFT ownership
     */
    public updateNFTStatus(hasNFT: boolean) {
        this.hasNFT = hasNFT;
        // console.log('NFT status updated:', hasNFT);
        this.updateButtonsBasedOnNFT();
    }

    /**
     * @notice Updates connection state and related UI
     * @dev Manages application state for wallet connection
     * @param isConnected Connection status
     * @param address Connected wallet address
     */
    public updateConnection(isConnected: boolean, address: string | null = null) {
        this.isConnected = isConnected;
        this.userAddress = address;

        if (!isConnected) {
            this.hasNFT = false;
            this.updateMintButtonState(ButtonState.DEFAULT);
            this.disableButtons();
            this.updateConnectButtonState(ButtonState.DEFAULT);
        } else if (isConnected && address) {
            this.updateConnectButtonState(ButtonState.COMPLETED);
        }
    }

    /**
     * @notice Updates experience points and display
     * @dev Manages experience state and UI updates
     * @param experience Raw experience value
     * @param formattedExperience Formatted display value
     */
    public updateExperience(experience: bigint, formattedExperience: string) {
        this.experience = experience;
        this.formattedExperience = formattedExperience;

        // Add this: Update display when experience changes
        const expElement = document.getElementById('ShapeXpAmount');
        if (expElement) {
            expElement.textContent = `shapexp: ${formattedExperience}`;
        }

        // console.log('Experience updated:', {
        //     raw: experience.toString(),
        //     formatted: formattedExperience
        // });
    }

    /**
     * @notice Updates button states based on NFT ownership
     * @dev Manages the enable/disable state of all buttons based on NFT ownership status
     * @custom:state-conditions
     * - Requires active wallet connection
     * - Updates based on NFT ownership flag
     * @custom:ui-updates
     * - Mint button: Disabled/Minted when owned, Enabled when not owned
     * - Experience buttons: Enabled when NFT owned, Disabled when not owned
     */
    private updateButtonsBasedOnNFT() {
        if (!this.isConnected) return;

        // console.log('Updating buttons based on NFT ownership:', this.hasNFT);
        const mintButton = document.getElementById('ShapeXpSandboxMint');

        if (this.hasNFT) {
            if (mintButton) {
                mintButton.className = ButtonClasses.getMintedClasses();
                mintButton.setAttribute('disabled', 'true');
                mintButton.textContent = 'Minted';
            }

            this.restrictedButtons.forEach(buttonId => {
                if (buttonId !== 'ShapeXpSandboxMint') {
                    const button = document.getElementById(buttonId);
                    if (button) {
                        button.className = ButtonClasses.getDefaultClasses();
                        button.removeAttribute('disabled');
                    }
                }
            });
        } else {
            if (mintButton) {
                mintButton.className = ButtonClasses.getDefaultClasses();
                mintButton.removeAttribute('disabled');
                mintButton.textContent = 'Mint ShapeXp';
            }

            this.restrictedButtons.forEach(buttonId => {
                if (buttonId !== 'ShapeXpSandboxMint') {
                    const button = document.getElementById(buttonId);
                    if (button) {
                        button.className = ButtonClasses.getDisabledClasses();
                        button.setAttribute('disabled', 'true');
                    }
                }
            });
        }
    }

    /**
     * @notice Initializes default button states
     * @dev Sets up initial button states on application load
     * @custom:initialization
     * - Disables all restricted buttons
     * - Enables connect button
     */
    private initializeButtonStates() {
        this.restrictedButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.className = ButtonClasses.getDisabledClasses();
                button.setAttribute('disabled', 'true');
            }
        });

        const connectButton = document.getElementById('ShapeXpSandboxConnect');
        if (connectButton) {
            connectButton.className = ButtonClasses.getDefaultClasses();
        }
    }

    /**
     * @notice Updates connect button state and appearance
     * @dev Manages connect button through different connection states
     * @param state Current button state
     * @custom:states
     * - DEFAULT: Initial/Disconnected state
     * - PROGRESS: Connection in progress
     * - COMPLETED: Successfully connected
     * @custom:ui-elements
     * - Button text
     * - Button classes
     * - Loading indicator
     */
    public updateConnectButtonState(state: ButtonState) {
        const button = document.getElementById('ShapeXpSandboxConnect');
        if (!button) return;

        const loadingIndicator = button.nextElementSibling as HTMLElement;

        switch (state) {
            case ButtonState.DEFAULT:
                button.textContent = 'Connect';
            button.className = ButtonClasses.getDefaultClasses();
            button.removeAttribute('disabled');
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            break;

            case ButtonState.PROGRESS:
                button.textContent = 'Connecting...';
            button.className = ButtonClasses.getProgressClasses();
            button.setAttribute('disabled', 'true');
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            break;

            case ButtonState.COMPLETED:
                button.textContent = 'Connected';
            button.className = ButtonClasses.getConnectedClasses();
            button.setAttribute('disabled', 'true');
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            break;
        }
    }

    /**
     * @notice Updates mint button state and appearance
     * @dev Manages mint button through different minting states
     * @param state Current button state
     * @custom:states
     * - DEFAULT: Ready to mint
     * - MINTING: Minting in progress
     * - MINTED: Successfully minted
     * @custom:ui-elements
     * - Button text
     * - Button classes
     * - Loading indicator
     */
    public updateMintButtonState(state: ButtonState) {
        const mintButton = document.getElementById('ShapeXpSandboxMint');
        if (!mintButton) return;

        const loadingIndicator = mintButton.nextElementSibling as HTMLElement;

        switch (state) {
            case ButtonState.DEFAULT:
                mintButton.textContent = 'Mint ShapeXp';
                mintButton.className = ButtonClasses.getDefaultClasses();
                mintButton.removeAttribute('disabled');
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
                break;

            case ButtonState.MINTING:
                mintButton.textContent = 'Minting...';
                mintButton.className = ButtonClasses.getProgressClasses();
                mintButton.setAttribute('disabled', 'true');
                if (loadingIndicator) loadingIndicator.classList.remove('hidden');
                break;

            case ButtonState.MINTED:
                mintButton.textContent = 'Minted';
                mintButton.className = ButtonClasses.getMintedClasses();
                mintButton.setAttribute('disabled', 'true');
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
                break;
        }
    }

    /**
     * @notice Updates experience button states
     * @dev Manages experience buttons through different states
     * @param buttonId ID of the button to update
     * @param state Current button state
     * @custom:states
     * - DEFAULT: Ready to gain experience
     * - GAINING: Experience gain in progress
     * - GAINED: Experience successfully added
     * @custom:button-types
     * - Low experience
     * - Mid experience
     * - High experience
     */
    public updateExperienceButtonState(buttonId: string, state: ButtonState) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const loadingIndicator = button.nextElementSibling as HTMLElement;
        const buttonType = buttonId.includes('Low') ? 'Low' : buttonId.includes('Mid') ? 'Mid' : 'High';

        switch (state) {
            case ButtonState.DEFAULT:
                button.textContent = `Gain ShapeXp (${buttonType})`;
                button.className = ButtonClasses.getDefaultClasses();
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
                break;

            case ButtonState.GAINING:
                button.textContent = 'Adding ShapeXp...';
                button.className = ButtonClasses.getProgressClasses();
                if (loadingIndicator) loadingIndicator.classList.remove('hidden');
                break;

            case ButtonState.GAINED:
                button.textContent = 'ShapeXp Added!';
                button.className = ButtonClasses.getDefaultClasses();
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
                break;
        }
    }

    /**
     * @notice Enables all restricted buttons
     * @dev Removes disabled state from all experience-related buttons
     * @custom:affected-buttons
     * - Mint button
     * - All experience gain buttons
     */
    private enableButtons() {
        this.restrictedButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.className = ButtonClasses.getDefaultClasses();
                button.removeAttribute('disabled');
            }
        });
    }

    /**
     * @notice Disables all restricted buttons
     * @dev Adds disabled state to all experience-related buttons
     * @custom:affected-buttons
     * - Mint button
     * - All experience gain buttons
     */
    private disableButtons() {
        this.restrictedButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.className = ButtonClasses.getDisabledClasses();
                button.setAttribute('disabled', 'true');
            }
        });
    }

    /**
     * @notice Resets application state to initial values
     * @dev Clears all state values and updates UI accordingly
     * @custom:reset-values
     * - Experience: 0
     * - NFT ownership: false
     * - Experience display: "0"
     */
    public resetState() {
        // Reset experience
        this.experience = BigInt(0);
        this.formattedExperience = '0';
        this.hasNFT = false;

        // Reset experience display
        const expElement = document.getElementById('ShapeXpAmount');
        if (expElement) {
            expElement.textContent = `shapexp: 0`;
        }
    }

    /**
     * @notice Getter methods for state values
     * @dev Provides read-only access to internal state
     */

    /**
     * @notice Returns singleton instance of AppState
     * @return AppState The singleton instance
     */
    public static getInstance(): AppState {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }


    /**
     * @notice Checks if user owns ShapeXp NFT
     * @return boolean True if user owns NFT
     */
    public getHasNFT(): boolean {
        return this.hasNFT;
    }

    /**
     * @notice Gets raw experience value
     * @return bigint Current experience amount
     */
    public getExperience(): bigint {
        return this.experience;
    }

    /**
     * @notice Gets formatted experience value
     * @return string Formatted experience amount
     */
    public getFormattedExperience(): string {
        return this.formattedExperience;
    }

    /**
     * @notice Checks if wallet is connected
     * @return boolean True if wallet is connected
     */
    public getIsConnected(): boolean {
        return this.isConnected;
    }

    /**
     * @notice Gets connected wallet address
     * @return string|null Connected address or null if not connected
     */
    public getUserAddress(): string | null {
        return this.userAddress;
    }
}
