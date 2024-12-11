// src/utils/log-manager.ts
import { LOGS, LogType } from '../constants/logging';

export class LogManager {
    private static instance: LogManager;
    private logWrap: HTMLElement | null;
    private logInfo: HTMLElement | null;
    private logLoading: HTMLElement | null;

    private constructor() {
        this.logInfo = document.getElementById(LOGS.ELEMENTS.INFO);
        this.logLoading = document.getElementById(LOGS.ELEMENTS.LOADING);
        this.logWrap = document.getElementById(LOGS.ELEMENTS.WRAP);
        this.logInfo = document.getElementById(LOGS.ELEMENTS.INFO);
        this.logLoading = document.getElementById(LOGS.ELEMENTS.LOADING);
    }

    public static getInstance(): LogManager {
        if (!LogManager.instance) {
            LogManager.instance = new LogManager();
        }
        return LogManager.instance;
    }

    public updateConnectionStatus(connected: boolean) {
        if (this.logInfo) {
            this.logInfo.textContent = connected ?
                LOGS.MESSAGES[LogType.CONNECTION].ADDED :
                LOGS.MESSAGES[LogType.CONNECTION].FAILED;
        }
    }

    public updateMintStatus(status: 'start' | 'success' | 'failed') {
        if (!this.logInfo || !this.logLoading) return;

        switch (status) {
            case 'start':
                this.logInfo.textContent = LOGS.MESSAGES[LogType.MINT].ADDING;
                this.logLoading.style.display = 'inline';
                break;
            case 'success':
                this.logInfo.textContent = LOGS.MESSAGES[LogType.MINT].ADDED;
                this.logLoading.style.display = 'none';
                break;
            case 'failed':
                this.logInfo.textContent = LOGS.MESSAGES[LogType.MINT].FAILED;
                this.logLoading.style.display = 'none';
                break;
        }
    }

}
