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
        this.updateLogMessage(LOGS.MESSAGES.EXPERIENCE_ADDING, true);
    }

    public showExperienceAdded() {
        console.log('Showing experience added state');
        this.updateLogMessage(LOGS.MESSAGES.EXPERIENCE_ADDED, false);
        this.setClearTimer(10000);
    }

    public showExperienceFailed(error?: string) {
        console.log('Showing experience failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.EXPERIENCE_FAILED}: ${error}` :
            LOGS.MESSAGES.EXPERIENCE_FAILED;
        this.updateLogMessage(message, false);
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

    // Singleton pattern to ensure only one instance
    public static getInstance(): LogManager {
        if (!LogManager.instance) {
            LogManager.instance = new LogManager();
        }
        return LogManager.instance;
    }

    // Update log message
    private updateLogMessage(message: string, showLoading: boolean = false) {
        console.log('Updating log message:', { message, showLoading });

        if (this.logInfo) {
            this.logInfo.textContent = message;
        }

        if (this.logLoading) {
            this.logLoading.style.display = showLoading ? 'inline' : 'none';
        }
    }

    // Public methods for different states
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
        this.updateLogMessage(LOGS.MESSAGES.NFT_ADDING, true);
    }

    public showNFTAdded() {
        console.log('Showing NFT added state');
        this.updateLogMessage(LOGS.MESSAGES.NFT_ADDED, false);
        this.setClearTimer(3000); // Clear after 3 seconds
    }

    public showNFTFailed(error?: string) {
        console.log('Showing NFT failed state', { error });
        const message = error ?
            `${LOGS.MESSAGES.NFT_FAILED}: ${error}` :
            LOGS.MESSAGES.NFT_FAILED;
        this.updateLogMessage(message, false);
        this.setClearTimer(10000); // Clear after 10 seconds
    }

}
