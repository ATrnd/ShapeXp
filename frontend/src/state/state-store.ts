// src/state/state-store.ts
import { LogManager } from '../utils/log-manager';

interface AppStateType {
    wallet: {
        connected: boolean;
        address: string;
        hasNFT: boolean;
    };
    ui: {
        currentPage: 'landing' | 'access';
    };
}

export class AppState {
    private static instance: AppState;
    private logManager: LogManager;

    private _state: AppStateType = {
        wallet: {
            connected: false,
            address: '',
            hasNFT: false,
        },
        ui: {
            currentPage: 'landing'
        }
    };

    private constructor() {
        this.logManager = LogManager.getInstance();
        this.refreshUI();
    }

    public static getInstance(): AppState {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }

    public updateConnection(connected: boolean, address: string = '') {
        console.log('Connection update:', { connected, address });
        this._state.wallet.connected = connected;
        this._state.wallet.address = address;

        // Update current page based on connection state
        this._state.ui.currentPage = connected ? 'access' : 'landing';

        // Update the log message
        this.logManager.updateConnectionStatus(connected);

        this.refreshUI();
        this.refreshNFTUI();
    }

    public updateNFTStatus(hasNFT: boolean) {
        console.log('State: Updating NFT status:', hasNFT);
        this._state.wallet.hasNFT = hasNFT;
        console.log('Current state after update:', this._state);
        this.refreshNFTUI();
    }

    private refreshNFTUI() {
        console.log('Refreshing NFT UI with state:', this._state.wallet);
        const mintButton = document.getElementById('ShapeXpMintButton');
        const configButton = document.getElementById('ShapeXpConfigButton');
        const noticeSection = document.getElementById('ShapeXpNoticeSection');

        console.log('Found UI elements:', {
            mintButton: !!mintButton,
            configButton: !!configButton,
            noticeSection: !!noticeSection
        });

        if (this._state.wallet.hasNFT) {
            if (mintButton) mintButton.style.display = 'none';
            if (configButton) configButton.style.display = 'block';
            if (noticeSection) noticeSection.style.display = 'none';
        } else {
            if (mintButton) mintButton.style.display = 'block';
            if (configButton) configButton.style.display = 'none';
            if (noticeSection) noticeSection.style.display = 'block';
        }
    }

    private refreshUI() {
        const landingPage = document.getElementById('landing-page');
        const accessPage = document.getElementById('access-page');
        const connectButton = document.getElementById('connect-wallet');

        // Update page visibility
        landingPage?.classList.toggle('active', this._state.ui.currentPage === 'landing');
        accessPage?.classList.toggle('active', this._state.ui.currentPage === 'access');

        // Update connect button visibility
        if (connectButton) {
            connectButton.style.display = this._state.wallet.connected ? 'none' : 'block';
        }

        // If we're showing the access page, also refresh NFT UI
        if (this._state.ui.currentPage === 'access') {
            this.refreshNFTUI();
        }
    }
}
