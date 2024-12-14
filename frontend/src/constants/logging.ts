/**
* @title Log Type Constants and Messages
* @notice Defines logging types and messages for ShapeXp system events
* @dev Constants for standardized logging across the application
* @custom:module-hierarchy Core Logging Component
*/

/**
* @notice Enum for all possible log event types
* @dev Used to identify the type of action being logged
* @custom:events
* - Experience: Experience point transactions
* - NFT: NFT inventory management
* - NFT Experience: NFT-specific experience
* - NFT Remove: NFT removal events
* - Mint: ShapeXp NFT minting
* - Connection: Wallet connection status
*/
export enum LogType {
    EXPERIENCE = 'experience',
    NFT = 'nft',
    NFT_EXPERIENCE = 'nftExperience',
    NFT_REMOVE = 'nftRemove',
    MINT = 'mint',
    CONNECTION = 'connection'
}

/**
* @notice Interface for log message structure
* @dev Defines the three states of any logged action
* @custom:states
* - ADDING: Action in progress
* - ADDED: Action completed successfully
* - FAILED: Action failed
*/
type LogMessage = {
    ADDING: string;
    ADDED: string;
    FAILED: string;
}

/**
* @notice Type mapping LogTypes to message structures
* @dev Creates a complete mapping of all log types to their messages
* @custom:mapping Maps each LogType enum to LogMessage structure
*/
type LogMessages = {
    [key in LogType]: LogMessage;
}

/**
* @notice Main logging configuration object
* @dev Contains all log messages and element IDs
* @custom:structure Two main sections:
* 1. MESSAGES: Action-specific log messages
* 2. ELEMENTS: DOM element IDs for log display
*/
export const LOGS = {
   /**
    * @notice Message configurations for each log type
    * @dev Mapped using LogType enum as keys
    * @custom:format Each type has three states: ADDING, ADDED, FAILED
    */
    MESSAGES: {
        [LogType.EXPERIENCE]: {
            ADDING: 'Adding experience...',
            ADDED: 'Experience added successfully!',
            FAILED: 'Failed to add experience'
        },
        [LogType.NFT]: {
            ADDING: 'Adding NFT to ShapeXp inventory...',
            ADDED: 'NFT added successfully!',
            FAILED: 'Failed to add NFT'
        },
        [LogType.NFT_EXPERIENCE]: {
            ADDING: 'Adding ShapeXp...',
            ADDED: 'ShapeXp added successfully!',
            FAILED: 'Failed to add ShapeXp'
        },
        [LogType.NFT_REMOVE]: {
            ADDING: 'Removing NFT from inventory...',
            ADDED: 'NFT removal completed!',
            FAILED: 'Failed to remove NFT'
        },
        [LogType.MINT]: {
            ADDING: 'Minting ShapeXp...',
            ADDED: 'ShapeXp minting completed!',
            FAILED: 'Failed to mint ShapeXp'
        },
        [LogType.CONNECTION]: {
            ADDING: 'Connecting...',
            ADDED: 'Connected',
            FAILED: 'Disconnected'
        }
    } as LogMessages,

   /**
    * @notice DOM element IDs for log display
    * @dev Used to locate and update log display elements
    * @custom:elements
    * - WRAP: Container element
    * - INFO: Message display element
    * - LOADING: Loading indicator element
    */
    ELEMENTS: {
        WRAP: 'ShapeXpLogWrap',
        INFO: 'ShapeXpLogNfo',
        LOADING: 'ShapeXpLoading'
    }
} as const;
