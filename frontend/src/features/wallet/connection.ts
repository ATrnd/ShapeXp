/**
* @title Wallet Connection Manager
* @notice Manages wallet connection state and Ethereum provider interactions
* @dev Handles wallet connection lifecycle, event listeners, and state management
* @custom:module-hierarchy Core Wallet Management Component
*/

import { AppState } from '../../state/state-store';
import { ButtonState } from '../../types/button-states';
import { ShapeXpManager } from '../nft/shapeXp-manager';
import { CooldownTimer } from '../../utils/cooldown-timer';

/**
* @notice Manages wallet connection and related state
* @dev Implements connection handling and Ethereum provider events
* @custom:ui-elements
* - Connect button
* - Connection status indicators
* - Loading states
*/
export class WalletConnection {
    private appState: AppState;
    private shapeXpManager: ShapeXpManager;
    private cooldownTimer: CooldownTimer;
    private readonly CONNECT_BUTTON_ID = 'ShapeXpSandboxConnect';

   /**
    * @notice Initializes wallet connection manager
    * @dev Sets up initial state and event listeners
    * @custom:flow
    * 1. Initialize dependencies
    * 2. Check existing connection
    * 3. Setup event listeners
    * 4. Initialize UI handlers
    */
    constructor() {
        // console.log('Initializing WalletConnection');
        // console.log('-----------------------------');
        this.appState = AppState.getInstance();
        this.shapeXpManager = new ShapeXpManager();
        this.cooldownTimer = CooldownTimer.getInstance();

        this.initializeState().then(() => {
            this.initializeConnection();
            this.setupEventListeners();
            this.setupDisabledClickHandler();
        });
    }

   /**
    * @notice Initializes wallet state from existing connection
    * @dev Checks for existing Ethereum provider connection
    * @custom:error-handling
    * - Handles missing provider
    * - Handles connection failures
    * - Handles state restoration errors
    */
    private async initializeState() {
        if (!window.ethereum?.request) return;

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            }) as string[];

            if (accounts.length > 0) {
                this.appState.updateConnection(true, accounts[0]);
                await this.shapeXpManager.checkShapeXpOwnership();
                this.appState.updateConnectButtonState(ButtonState.COMPLETED);
            } else {
                this.appState.updateConnection(false);
                this.appState.updateConnectButtonState(ButtonState.DEFAULT);
            }
        } catch (error) {
            console.error('Error checking initial state:', error);
            this.appState.updateConnection(false);
            this.appState.updateConnectButtonState(ButtonState.DEFAULT);
        }
    }

   /**
    * @notice Sets up handler for disabled connection button
    * @dev Prevents interaction when already connected
    */
    private setupDisabledClickHandler() {
        const connectButton = document.getElementById(this.CONNECT_BUTTON_ID);
        if (!connectButton) return;

        connectButton.addEventListener('click', (_) => {
            if (this.appState.getIsConnected()) {
                console.log('already connected, connection disabled');
            }
        });
    }

   /**
    * @notice Initializes wallet connection functionality
    * @dev Sets up connection request handling and state updates
    * @custom:error-handling
    * - Provider not found
    * - User rejection
    * - Connection failures
    */
    private async initializeConnection() {
        const connectButton = document.getElementById(this.CONNECT_BUTTON_ID);
        if (!connectButton || !window.ethereum || !window.ethereum.request) return;

        connectButton.addEventListener('click', async () => {
            if (this.appState.getIsConnected()) return;

            try {
                if (!window.ethereum || !window.ethereum.request) {
                    throw new Error('Ethereum provider not found');
                }

                this.appState.updateConnectButtonState(ButtonState.PROGRESS);

                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                }) as string[];

                if (accounts.length > 0) {
                    this.appState.updateConnection(true, accounts[0]);
                    await this.shapeXpManager.checkShapeXpOwnership();
                    console.log('Connected:', accounts[0]);
                }

            } catch (error) {
                console.error('Connection error:', error);
                this.appState.updateConnection(false);
                this.appState.updateConnectButtonState(ButtonState.DEFAULT);
            }
        });
    }

   /**
    * @notice Sets up Ethereum provider event listeners
    * @dev Handles account changes and disconnection events
    * @custom:events
    * - accountsChanged
    * - disconnect
    * @custom:state-updates
    * - Connection status
    * - Account address
    * - NFT ownership
    * - Cooldown timer
    */
    private setupEventListeners() {
        if (!window.ethereum?.on) return;

        window.ethereum.on('accountsChanged', async (accounts: string[]) => {
            if (accounts.length === 0) {
                this.appState.resetState();
                this.cooldownTimer.resetTimer();
                this.appState.updateConnection(false);
            } else {
                this.appState.updateConnection(true, accounts[0]);
                await this.shapeXpManager.checkShapeXpOwnership();
                console.log('Account changed:', accounts[0]);
            }
        });

        window.ethereum.on('disconnect', async () => {
            this.appState.updateConnection(false);
            this.cooldownTimer.resetTimer();
            await this.shapeXpManager.checkShapeXpOwnership();
            console.log('Wallet disconnected');
        });
    }

   /**
    * @notice Checks for existing wallet connection
    * @dev Queries Ethereum provider for connected accounts
    * @custom:error-handling
    * - Provider not found
    * - Request failures
    */
    private async checkExistingConnection() {
        if (!window.ethereum?.request) return;

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            }) as string[];

            if (accounts.length > 0) {
                this.appState.updateConnection(true, accounts[0]);
                console.log('Found existing connection:', accounts[0]);
            }
        } catch (error) {
            console.error('Error checking existing connection:', error);
        }
    }

   /**
    * @notice Updates button loading state
    * @dev Manages button and loading indicator visibility
    * @param buttonId The ID of the button to update
    * @param isLoading Loading state to set
    */
    private setButtonLoading(buttonId: string, isLoading: boolean) {
        const button = document.getElementById(buttonId);
        const loadingIndicator = button?.nextElementSibling as HTMLElement;

        if (button && loadingIndicator) {
            if (isLoading) {
                button.setAttribute('disabled', 'true');
                loadingIndicator.classList.remove('hidden');
            } else {
                button.removeAttribute('disabled');
                loadingIndicator.classList.add('hidden');
            }
        }
    }
}
