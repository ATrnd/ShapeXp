/**
* @title ShapeXp Application Entry Point
* @notice Initializes core application components and state
* @dev Main entry point for ShapeXp dApp
* @custom:module-hierarchy Application Root
*/

import './style.css'
import { AppState } from './src/state/state-store'
import { WalletConnection } from './src/features/wallet/connection'
import { ExperienceManager } from './src/features/experience/experience-manager';

/**
* @notice Application Initialization
* @dev Initializes core application components in the following order:
* 1. State Management
* 2. Wallet Connection
* 3. Experience System
*/

/**
* @notice Initialize global application state
* @dev Creates singleton instance of AppState
* @custom:state-management Central state controller
*/
const appState = AppState.getInstance();

/**
* @notice Initialize wallet connection manager
* @dev Sets up wallet connection handling and events
* @custom:requires MetaMask extension
*/
const walletConnection = new WalletConnection();

/**
* @notice Initialize experience management system
* @dev Sets up experience gain functionality and cooldowns
* @custom:requires Active wallet connection
*/
const experienceManager = new ExperienceManager();

/**
* @notice Debug access to application state
* @dev Exposes AppState instance globally for debugging
* @custom:environment Development only
* @custom:security Should be removed in production
*/
(window as any).appState = appState;
