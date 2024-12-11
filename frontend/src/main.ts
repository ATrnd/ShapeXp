// src/main.ts
import { AppState } from './state/state-store';
import { WalletConnection } from './features/wallet/connection';
import { ShapeXpManager } from './features/nft/shapeXp-manager';
import './style.css';

// Add type declaration for ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize state first
    AppState.getInstance();
    // Initialize wallet connection
    new WalletConnection();
});
