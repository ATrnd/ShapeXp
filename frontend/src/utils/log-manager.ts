// src/utils/log-manager.ts
import { LOGS, LogType } from '../constants/logging';

export class LogManager {
    private static instance: LogManager;
    private logInfo: HTMLElement | null;
    private logLoading: HTMLElement | null;

    private constructor() {
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
}
