// src/main.ts
import { AppState } from './state/state-store';
import { WalletConnection } from './features/wallet/connection';
import { ExperienceButtonManager } from './features/experience/experience-manager';
import './style.css';

// Add type declaration for ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    AppState.getInstance();
    new WalletConnection();
    new ExperienceButtonManager();
});
