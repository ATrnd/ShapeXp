// src/utils/log-manager.ts
import { LOGS } from '../constants/logging';

export class LogManager {
    private static instance: LogManager;
    private logWrap: HTMLElement | null;
    private logInfo: HTMLElement | null;
    private logLoading: HTMLElement | null;
    private clearTimer: NodeJS.Timeout | null = null;

    private constructor() {
        // Get references to DOM elements
        this.logWrap = document.getElementById(LOGS.ELEMENTS.WRAP);
        this.logInfo = document.getElementById(LOGS.ELEMENTS.INFO);
        this.logLoading = document.getElementById(LOGS.ELEMENTS.LOADING);

        console.log('LogManager initialized with elements:', {
            wrap: this.logWrap,
            info: this.logInfo,
            loading: this.logLoading
        });
    }

    public showExperienceAdding() {
        console.log('Showing experience adding state');
        this.updateLogMessage(LOGS.MESSAGES.EXPERIENCE_ADDING, true, true);
    }

    public showExperienceAdded() {
        console.log('Showing experience added state');
        this.updateLogMessage(LOGS.MESSAGES.EXPERIENCE_ADDED, false, true);
    }

    public showExperienceFailed(error?: string) {
        console.log('Showing experience failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.EXPERIENCE_FAILED}: ${error}` :
            LOGS.MESSAGES.EXPERIENCE_FAILED;
        this.updateLogMessage(message, false, false);
        this.setClearTimer(10000);
    }

    public clearLogMessage() {
        this.clearLog();
    }

    private clearLog() {
        console.log('Clearing log message');
        if (this.logInfo) {
            this.logInfo.textContent = '';
        }
        if (this.logLoading) {
            this.logLoading.style.display = 'none';
        }
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
            this.clearTimer = null;
        }
    }

    private setClearTimer(delay: number) {
        // Clear any existing timer first
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
        }

        // Set new timer
        this.clearTimer = setTimeout(() => {
            this.clearLog();
            this.clearTimer = null;
        }, delay);

        console.log(`Set clear timer for ${delay}ms`);
    }

    public static getInstance(): LogManager {
        if (!LogManager.instance) {
            LogManager.instance = new LogManager();
        }
        return LogManager.instance;
    }

    private updateLogMessage(message: string, showLoading: boolean = false, persistent: boolean = false) {
        console.log('Updating log message:', { message, showLoading, persistent });

        if (this.logInfo) {
            this.logInfo.textContent = message;
        }

        if (this.logLoading) {
            this.logLoading.style.display = showLoading ? 'inline' : 'none';
        }

        // If not persistent and no timer is set, set a default timer
        if (!persistent && !this.clearTimer) {
            this.setClearTimer(10000);
        }
    }

    public showConnected() {
        console.log('Showing connected state');
        this.updateLogMessage(LOGS.MESSAGES.CONNECTED);
    }

    public showDisconnected() {
        console.log('Showing disconnected state');
        this.updateLogMessage(LOGS.MESSAGES.DISCONNECTED);
    }

    public showConnecting() {
        console.log('Showing connecting state');
        this.updateLogMessage(LOGS.MESSAGES.CONNECTING, true);
    }

    public showNFTAdding() {
        console.log('Showing NFT adding state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_ADDING, true, true);
    }

    public showNFTAdded() {
        console.log('Showing NFT added state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_ADDED, false, true);
    }

    public showNFTFailed(error?: string) {
        console.log('Showing NFT failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.NFT_FAILED}: ${error}` :
            LOGS.MESSAGES.NFT_FAILED;
        this.updateLogMessage(message, false, false);
    }

    public showNFTExperienceAdding() {
        console.log('Showing NFT experience adding state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_EXP_ADDING, true, true);
    }

    public showNFTExperienceAdded() {
        console.log('Showing NFT experience added state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_EXP_ADDED, false, true);
    }

    public showNFTExperienceFailed(error?: string) {
        console.log('Showing NFT experience failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.NFT_EXP_FAILED}: ${error}` :
            LOGS.MESSAGES.NFT_EXP_FAILED;
        this.updateLogMessage(message, false, false);
    }

    public showNFTRemoving() {
        console.log('Showing NFT removing state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_REMOVING, true, true);
    }

    public showNFTRemoved() {
        console.log('Showing NFT removed state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_REMOVED, false, true);
    }

    public showNFTRemoveFailed(error?: string) {
        console.log('Showing NFT remove failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.NFT_REMOVE_FAILED}: ${error}` :
            LOGS.MESSAGES.NFT_REMOVE_FAILED;
        this.updateLogMessage(message, false, false);
    }

    public showMintStarting() {
        console.log('Showing mint starting state');
        this.updateLogMessage(LOGS.MESSAGES.MINT_STARTING, true);
    }

    public showMintCompleted() {
        console.log('Showing mint completed state');
        this.updateLogMessage(LOGS.MESSAGES.MINT_COMPLETED, false);
        this.setClearTimer(10000);
    }

    public showMintFailed(error?: string) {
        console.log('Showing mint failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.MINT_FAILED}: ${error}` :
            LOGS.MESSAGES.MINT_FAILED;
        this.updateLogMessage(message, false);
        this.setClearTimer(10000);
    }

}
