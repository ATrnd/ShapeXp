// src/utils/log-manager.ts
import { LOGS, LogType } from '../constants/logging';

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

        if (!persistent && !this.clearTimer) {
            // this.setClearTimer(10000);
        }
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
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
        }

        this.clearTimer = setTimeout(() => {
            this.clearLog();
            this.clearTimer = null;
        }, delay);

        console.log(`Set clear timer for ${delay}ms`);
    }

    public showStarting(type: LogType) {
        console.log(`Showing ${type} starting state`);
        this.updateLogMessage(LOGS.MESSAGES[type].ADDING, true, true);
    }

    public showSuccess(type: LogType) {
        console.log(`Showing ${type} success state`);
        this.updateLogMessage(LOGS.MESSAGES[type].ADDED, false, true);
    }

    public showError(type: LogType, error?: string) {
        console.log(`Showing ${type} error state`, { error });
        const message = error ?
            `${LOGS.MESSAGES[type].FAILED}: ${error}` :
            LOGS.MESSAGES[type].FAILED;
        this.updateLogMessage(message, false, false);
    }

    public clearLogMessage() {
        this.clearLog();
    }

}
