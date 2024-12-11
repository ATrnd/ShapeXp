// src/features/wallet/connection.ts
import { AppState } from '../../state/state-store';
import { ShapeXpManager } from '../nft/shapeXp-manager';

export class WalletConnection {
    private appState: AppState;
    private shapeXpManager: ShapeXpManager;

    constructor() {
        console.log('Initializing WalletConnection');
        console.log('-----------------------------');
        this.appState = AppState.getInstance();
        this.shapeXpManager = new ShapeXpManager();
        this.initializeConnection();
        this.checkExistingConnection();
        this.setupEventListeners();
    }

    private async initializeConnection() {
        const connectButton = document.getElementById('connect-wallet');
        if (!connectButton) return;

        connectButton.addEventListener('click', async () => {
            try {
                // Request accounts from MetaMask
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                this.appState.updateConnection(true, accounts[0]);
                console.log('Checking NFT ownership after connection...');
                await this.shapeXpManager.checkShapeXpOwnership();

            } catch (error) {
                console.error('Connection error:', error);
                this.appState.updateConnection(false);
            }
        });
    }

    private setupEventListeners() {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', async (accounts: string[]) => {
            if (accounts.length === 0) {
                this.appState.updateConnection(false);
            } else {
                this.appState.updateConnection(true, accounts[0]);
                await this.shapeXpManager.checkShapeXpOwnership();
            }
        });
    }

    private async checkExistingConnection() {
        if (!window.ethereum) return;

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length > 0) {
                this.appState.updateConnection(true, accounts[0]);
                await this.shapeXpManager.checkShapeXpOwnership();
            }
        } catch (error) {
            console.error('Error checking existing connection:', error);
        }
    }
}
