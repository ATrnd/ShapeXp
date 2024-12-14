/**
* @title Log Management System
* @notice Manages application status logging and display
* @dev Implements singleton pattern for centralized log management
* @custom:module-hierarchy Core Logging Component
*/

import { LOGS, LogType } from '../constants/logging';

/**
* @notice Manages application status logs and UI updates
* @dev Controls status message display and loading indicators
* @custom:ui-elements
* - Log wrapper
* - Status message display
* - Loading indicator
*/
export class LogManager {
    private static instance: LogManager;
    private logWrap: HTMLElement | null;
    private logInfo: HTMLElement | null;
    private logLoading: HTMLElement | null;

   /**
    * @notice Private constructor enforcing singleton pattern
    * @dev Initializes DOM element references
    * @custom:elements
    * - Info: Status message element
    * - Loading: Loading indicator element
    * - Wrap: Container element
    */
    private constructor() {
        this.logInfo = document.getElementById(LOGS.ELEMENTS.INFO);
        this.logLoading = document.getElementById(LOGS.ELEMENTS.LOADING);
        this.logWrap = document.getElementById(LOGS.ELEMENTS.WRAP);
    }

   /**
    * @notice Returns singleton instance of LogManager
    * @dev Creates instance if it doesn't exist
    * @return LogManager The singleton instance
    */
    public static getInstance(): LogManager {
        if (!LogManager.instance) {
            LogManager.instance = new LogManager();
        }
        return LogManager.instance;
    }

   /**
    * @notice Updates wallet connection status
    * @dev Updates status message based on connection state
    * @param connected Boolean indicating connection status
    * @custom:messages
    * - Connected: "Connected"
    * - Disconnected: "Disconnected"
    */
    public updateConnectionStatus(connected: boolean) {
        if (this.logInfo) {
            this.logInfo.textContent = connected ?
                LOGS.MESSAGES[LogType.CONNECTION].ADDED :
                LOGS.MESSAGES[LogType.CONNECTION].FAILED;
        }
    }

   /**
    * @notice Updates NFT minting status
    * @dev Manages minting process status and loading state
    * @param status Current minting status ('start' | 'success' | 'failed')
    * @custom:states
    * - start: Show loading, "Minting ShapeXp..."
    * - success: Hide loading, "ShapeXp minting completed!"
    * - failed: Hide loading, "Failed to mint ShapeXp"
    */
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

   /**
    * @notice Updates experience gain status
    * @dev Manages experience addition status and loading state
    * @param status Current experience status
    * @param errorMessage Optional error message for failed state
    * @custom:states
    * - start: Show loading, "Adding experience..."
    * - success: Hide loading, "Experience added successfully!"
    * - failed: Hide loading, Custom error or "Failed to add experience"
    */
    public updateExperienceStatus(status: 'start' | 'success' | 'failed', errorMessage?: string) {
        if (!this.logInfo || !this.logLoading) return;

        switch (status) {
            case 'start':
                this.logInfo.textContent = LOGS.MESSAGES[LogType.EXPERIENCE].ADDING;
                this.logLoading.style.display = 'inline';
                break;
            case 'success':
                this.logInfo.textContent = LOGS.MESSAGES[LogType.EXPERIENCE].ADDED;
                this.logLoading.style.display = 'none';
                break;
            case 'failed':
                this.logInfo.textContent = errorMessage || LOGS.MESSAGES[LogType.EXPERIENCE].FAILED;
                this.logLoading.style.display = 'none';
                break;
        }
    }
}
