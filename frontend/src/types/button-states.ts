/**
* @title Button and Experience State Enums
* @notice Defines button states and experience amount types
* @dev Core enums for UI state management and experience system
* @custom:module-hierarchy Core Type Definitions
*/

/**
* @notice Enum defining all possible button states
* @dev Used for managing button UI states across the application
* @custom:state-groups
* - Generic States: DEFAULT, PROGRESS, COMPLETED
* - Minting States: MINTING, MINTED
* - Experience States: GAINING, GAINED
*/
export enum ButtonState {
   /**
    * @notice Default/initial button state
    * @dev Base state for interactive buttons
    */
    DEFAULT = 'default',

   /**
    * @notice Progress/loading state
    * @dev Used when action is processing
    */
    PROGRESS = 'progress',

   /**
    * @notice Completed state
    * @dev Used after successful action completion
    */
    COMPLETED = 'completed',

   /**
    * @notice NFT minting in progress
    * @dev Active during NFT mint transaction
    */
    MINTING = 'minting',

   /**
    * @notice NFT successfully minted
    * @dev Final state after successful mint
    */
    MINTED = 'minted',

   /**
    * @notice Experience points being added
    * @dev Active during experience gain transaction
    */
    GAINING = 'gaining',

   /**
    * @notice Experience successfully added
    * @dev Temporary state after experience gain
    */
    GAINED = 'gained'
}

/**
* @notice Enum defining experience gain amounts
* @dev Used for experience transaction parameters
* @custom:amounts
* - LOW: 1000 experience points
* - MID: 2500 experience points
* - HIGH: 5000 experience points
*/
export enum ExperienceAmount {

   /**
    * @notice Lowest experience gain amount
    * @dev Maps to 1000 experience points
    */
    LOW,

   /**
    * @notice Medium experience gain amount
    * @dev Maps to 2500 experience points
    */
    MID,

   /**
    * @notice Highest experience gain amount
    * @dev Maps to 5000 experience points
    */
    HIGH
}
