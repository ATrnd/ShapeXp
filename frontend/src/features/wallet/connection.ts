// src/features/wallet/connection.ts
import { AppState } from '../../state/state-store';
import { ShapeXpManager } from '../nft/shapeXp-manager';

export class WalletConnection {
    private appState: AppState;
    private shapeXpManager: ShapeXpManager;

    constructor() {
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
                await this.shapeXpManager.checkShapeXpOwnership();
            } catch (error) {
                console.error('Connection error:', error);
                this.appState.updateConnection(false);
            }
        });
    }

    private setupEventListeners() {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                this.appState.updateConnection(false);
            } else {
                this.appState.updateConnection(true, accounts[0]);
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

// import { getCurrentAddress, getProvider } from '../../utils/provider';
// import { checkShapeXpNFTOwnership } from '../nft/validation';
// import { LogManager } from '../../utils/log-manager';
// import { LogType } from '../../constants';
// import { AppState } from '../../state/state-store';
// import { StateDebugger } from '../../utils/debug-helper';
//
//
// export class WalletConnection {
//     private logManager: LogManager;
//     private appState: AppState;
//     private debugger: StateDebugger;
//
//     constructor() {
//         this.logManager = LogManager.getInstance();
//         this.appState = AppState.getInstance();
//         this.debugger = StateDebugger.getInstance();
//
//         this.checkExistingConnection().then(() => {
//             this.initializeConnection();
//             this.setupEventListeners();
//         });
//     }
//
//     private async initializeConnection() {
//         const connectButton = document.getElementById('connect-wallet');
//         if (!connectButton) {
//             console.error('Connect button not found');
//             return;
//         }
//
//         connectButton.addEventListener('click', async () => {
//             try {
//                 this.debugger.logStateChange('Connection Flow Started', {});
//                 this.logManager.showStarting(LogType.CONNECTION);
//
//                 const address = await getCurrentAddress();
//                 this.appState.updateWalletConnection(true, address);
//
//                 const hasNFT = await checkShapeXpNFTOwnership();
//                 this.appState.updateNFTStatus(hasNFT);
//
//                 this.debugger.logStateChange('Setting Page to Access', {
//                     hasNFT,
//                     address
//                 });
//
//                 // Add slight delay for state updates to complete
//                 setTimeout(() => {
//                     this.appState.setCurrentPage('access');
//                 }, 100);
//
//                 this.logManager.showSuccess(LogType.CONNECTION);
//
//             } catch (error: any) {
//                 console.error('Connection error:', error);
//                 this.appState.updateWalletConnection(false);
//                 this.logManager.showError(LogType.CONNECTION, error.message);
//             }
//         });
//     }
//
//     private setupEventListeners() {
//         const ethereum = window.ethereum;
//
//         if (!ethereum || !ethereum.on) {
//             console.log('MetaMask not installed or ethereum.on not available');
//             return;
//         }
//
//         ethereum.on('accountsChanged', async (accounts: string[]) => {
//             if (accounts.length === 0) {
//                 this.appState.updateWalletConnection(false);
//                 this.appState.setCurrentPage('landing');
//                 this.logManager.showError(LogType.CONNECTION, 'Disconnected');
//             } else {
//                 this.appState.updateWalletConnection(true, accounts[0]);
//                 const hasNFT = await checkShapeXpNFTOwnership();
//                 this.appState.updateNFTStatus(hasNFT);
//                 this.appState.setCurrentPage('access');
//             }
//         });
//
//         ethereum.on('chainChanged', () => {
//             window.location.reload();
//         });
//     }
//
//     private async checkExistingConnection() {
//         try {
//             const ethereum = window.ethereum;
//             if (!ethereum) {
//                 console.log('MetaMask not installed');
//                 return;
//             }
//
//             const provider = await getProvider();
//             const accounts = await provider.listAccounts();
//
//             if (accounts.length > 0) {
//                 this.debugger.logStateChange('Existing Connection Found', {
//                     account: accounts[0].address
//                 });
//
//                 // First update wallet connection
//                 this.appState.updateWalletConnection(true, accounts[0].address);
//
//                 // Then check NFT ownership
//                 const hasNFT = await checkShapeXpNFTOwnership();
//                 this.appState.updateNFTStatus(hasNFT);
//
//                 // Finally transition to access page
//                 this.debugger.logStateChange('Transitioning to Access Page', {
//                     hasNFT,
//                     currentPage: this.appState.state.ui.currentPage
//                 });
//
//                 setTimeout(() => {
//                     this.appState.setCurrentPage('access');
//                 }, 100);
//             }
//         } catch (error) {
//             console.error('Error checking existing connection:', error);
//         }
//     }
// }
