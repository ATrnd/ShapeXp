// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title ShapeXpInvExp
 * @notice A dual experience system for NFTs with inventory management
 * @dev Implements a system where users can:
 * - Manage an inventory of NFTs (max 3 slots)
 * - Accumulate global experience points
 * - Transfer experience points to specific NFTs
 * - Experience gains are subject to cooldown and caps
 * @custom:security-contact atrnd.work@gmail.com
 */
contract ShapeXpInvExp {
    // ==========
    //  CONSTANTS
    // ==========

    /**
     * @dev Maximum experience points that can be accumulated (global or per NFT)
     */
    uint256 private constant MAX_EXPERIENCE = 100000;

    /**
     * @dev Time period users must wait between gaining experience
     */
    uint256 private constant COOLDOWN_PERIOD = 30 minutes;

    /**
     * @dev Amount of experience points transferred from global to NFT-specific
     */
    uint256 private immutable TRANSFER_EXPERIENCE_AMOUNT;

    /**
     * @dev Reference to the ShapeXpNFT contract that gates access to this system
     */
    IERC721 private immutable s_shapeNFTCtr;

    // =====
    // ENUMS
    // =====

    /**
     * @dev Experience amount tiers for global experience gains
     */
    enum ExperienceAmount {
        LOW,
        MID,
        HIGH
    }

    // =======
    // STRUCTS
    // =======

    /**
     * @dev Stores user's NFT inventory with fixed size of 3 slots
     * @param nftContracts Array of NFT contract addresses, empty slots are address(0)
     * @param tokenIds Array of token IDs corresponding to the contracts, empty slots are 0
     * @notice Inventory slots are fixed at 3 and cannot be expanded
     */
    struct UserInventory {
        address[3] nftContracts;
        uint256[3] tokenIds;
    }

    /**
     * @dev Tracks experience points for a specific NFT
     * @param targetNftContract Address of the NFT contract
     * @param tokenId Token ID within the contract
     * @param experience Amount of experience points accumulated
     * @param lastUpdateTimestamp Last time experience was added
     */
    struct NFTExperience {
        address targetNftContract;
        uint256 tokenId;
        uint256 experience;
        uint256 lastUpdateTimestamp;
    }

    /**
     * @dev Tracks user's experience gain cooldown status
     * @param lastExperienceGain Timestamp of last experience gain
     * @param isOnCooldown Whether user is currently on cooldown
     */
    struct UserCooldown {
        uint256 lastExperienceGain;
        bool isOnCooldown;
    }

    // ===============
    // STATE VARIABLES
    // ===============

    /// @dev Maps experience type to its corresponding amount
    mapping(ExperienceAmount => uint256) private s_experienceAmounts;

    /// @dev Maps experience type to its validation status
    mapping(ExperienceAmount => bool) private s_validExperienceTypes;

    /// @dev Maps user address to their NFT inventory
    mapping(address => UserInventory) private s_userInventories;

    /// @dev Maps user address and NFT key to its experience data
    mapping(address => mapping(bytes32 => NFTExperience)) private s_userNFTExperience;

    /// @dev Maps user address to their global experience balance
    mapping(address => uint256) private s_userGlobalExperience;

    /// @dev Maps user address to their cooldown status
    mapping(address => UserCooldown) private s_userCooldowns;

    // ======
    // EVENTS
    // ======

    /**
     * @dev Emitted when experience is added to an NFT
     * @param user Address of the user
     * @param targetNftContract Address of the NFT contract
     * @param tokenId Token ID that received experience
     * @param amount Amount of experience added
     * @param newTotal New total experience for this NFT
     */
    event ExperienceAdded(
        address indexed user,
        address indexed targetNftContract,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 newTotal
    );

    /**
     * @dev Emitted when global experience is added to user's pool
     * @param user Address of the user receiving experience
     * @param expType Type of experience gained (LOW, MID, HIGH)
     * @param amount Amount of experience points added
     * @param newTotal New total global experience points
     */
    event GlobalExperienceAdded(address indexed user, ExperienceAmount expType, uint256 amount, uint256 newTotal);

    /**
     * @dev Emitted when global experience is deducted for NFT experience transfer
     * @param user Address of the user
     * @param amount Amount of experience points deducted
     * @param remaining Remaining global experience points
     */
    event GlobalExperienceDeducted(address indexed user, uint256 amount, uint256 remaining);

    /**
     * @dev Emitted when experience gain is capped at MAX_EXPERIENCE
     * @param user Address of the user
     * @param expType Type of experience attempted
     * @param attemptedAmount Original amount attempted to add
     * @param cappedAmount Actual amount added after capping
     */
    event ExperienceCapped(
        address indexed user, ExperienceAmount expType, uint256 attemptedAmount, uint256 cappedAmount
    );

    /**
     * @dev Emitted when NFT experience gain is capped at MAX_EXPERIENCE
     * @param user Address of the user
     * @param attemptedAmount Original amount attempted to add
     * @param cappedAmount Actual amount added after capping
     */
    event ExperienceCappedNFT(address indexed user, uint256 attemptedAmount, uint256 cappedAmount);

    // ======
    // ERRORS
    // ======

    /// @dev Thrown when contract address doesn't implement ERC721
    error ShapeXpInvExp__InvalidERC721Contract();

    /// @dev Thrown when attempting to add ShapeXpNFT to inventory
    error ShapeXpInvExp__InvalidShapeXpContract();

    /// @dev Thrown when caller doesn't own a ShapeXpNFT
    error ShapeXpInvExp__NotShapeXpNFTOwner();

    /// @dev Thrown when attempting to add NFT to full inventory
    error ShapeXpInvExp__InventoryFull();

    /// @dev Thrown when caller doesn't own the target NFT
    error ShapeXpInvExp__NotNFTOwner();

    /// @dev Thrown when attempting to add an NFT that's already in user's inventory
    error ShapeXpInvExp__NFTAlreadyInInventory();

    /// @dev Thrown when attempting to remove an NFT that's not in user's inventory
    error ShapeXpInvExp__NFTNotInInventory();

    /// @dev Thrown when user's global experience balance is insufficient for transfer
    error ShapeXpInvExp__InsufficientGlobalExperience();

    /// @dev Thrown when attempting to add experience to an NFT not in inventory
    error ShapeXpInvExp__NotInInventory();

    /// @dev Thrown when attempting to gain experience during cooldown period
    /// @param timeRemaining Seconds remaining until cooldown expires
    error ShapeXpInvExp__OnCooldown(uint256 timeRemaining);

    /// @dev Thrown when attempting to use an invalid or undefined experience type
    error ShapeXpInvExp__InvalidExperienceType();

    // ===========
    // CONSTRUCTOR
    // ===========

    /**
     * @notice Initializes the experience system with the ShapeXpNFT contract
     * @dev Sets up experience amounts and valid experience types
     * @param shapeNFTCtr Address of the ShapeXpNFT contract
     */
    constructor(address shapeNFTCtr) {
        if (shapeNFTCtr == address(0) || !_isERC721(shapeNFTCtr)) {
            revert ShapeXpInvExp__InvalidERC721Contract();
        }
        s_shapeNFTCtr = IERC721(shapeNFTCtr);
        TRANSFER_EXPERIENCE_AMOUNT = 500;

        // Initialize experience amounts
        s_experienceAmounts[ExperienceAmount.LOW] = 1000;
        s_experienceAmounts[ExperienceAmount.MID] = 2500;
        s_experienceAmounts[ExperienceAmount.HIGH] = 5000;

        // Mark valid experience types
        s_validExperienceTypes[ExperienceAmount.LOW] = true;
        s_validExperienceTypes[ExperienceAmount.MID] = true;
        s_validExperienceTypes[ExperienceAmount.HIGH] = true;
    }

    // ==================
    // EXTERNAL FUNCTIONS
    // ==================

    /**
     * @notice Adds experience points to user's global experience pool
     * @dev Subject to cooldown period and maximum experience cap
     * @param expType Type of experience amount to add (LOW, MID, HIGH)
     */
    function addGlobalExperience(ExperienceAmount expType) external {
        validateShapeXpNFTOwnership();
        _validateCooldownPeriod();
        _validateExperienceType(expType);

        uint256 amount = _getExperienceAmount(expType);
        uint256 newTotal = s_userGlobalExperience[msg.sender] + amount;

        if (newTotal > MAX_EXPERIENCE) {
            uint256 cappedAmount = MAX_EXPERIENCE - s_userGlobalExperience[msg.sender];
            s_userGlobalExperience[msg.sender] = MAX_EXPERIENCE;
            emit ExperienceCapped(msg.sender, expType, amount, cappedAmount);
            emit GlobalExperienceAdded(msg.sender, expType, cappedAmount, MAX_EXPERIENCE);
        } else {
            s_userGlobalExperience[msg.sender] = newTotal;
            emit GlobalExperienceAdded(msg.sender, expType, amount, newTotal);
        }
    }

    /**
     * @notice Adds an NFT to user's inventory
     * @dev Requires ShapeXpNFT ownership and available inventory slot
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to add
     */
    function addNFTToInventory(address nftContract, uint256 tokenId) external {
        validateShapeXpNFTOwnership();
        validateNFTOwnership(nftContract, tokenId);
        validateNonShapeXpNFT(nftContract);

        UserInventory storage inventory = s_userInventories[msg.sender];

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == nftContract && inventory.tokenIds[i] == tokenId) {
                revert ShapeXpInvExp__NFTAlreadyInInventory();
            }
        }

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == address(0)) {
                inventory.nftContracts[i] = nftContract;
                inventory.tokenIds[i] = tokenId;
                return;
            }
        }

        revert ShapeXpInvExp__InventoryFull();
    }

    /**
     * @notice Removes an NFT from user's inventory
     * @dev Requires ShapeXpNFT ownership and NFT presence in inventory
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to remove
     */
    function removeNFTFromInventory(address nftContract, uint256 tokenId) external {
        validateShapeXpNFTOwnership();
        validateNFTOwnership(nftContract, tokenId);

        UserInventory storage inventory = s_userInventories[msg.sender];
        bool found = false;
        uint256 foundIndex;

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == nftContract && inventory.tokenIds[i] == tokenId) {
                found = true;
                foundIndex = i;
                break;
            }
        }

        if (!found) {
            revert ShapeXpInvExp__NFTNotInInventory();
        }

        // Reset experience data
        bytes32 nftKey = _generateNFTKey(nftContract, tokenId);
        NFTExperience storage nftExp = s_userNFTExperience[msg.sender][nftKey];
        nftExp.targetNftContract = address(0);
        nftExp.tokenId = 0;
        nftExp.experience = 0;
        nftExp.lastUpdateTimestamp = 0;

        // Remove from inventory
        inventory.nftContracts[foundIndex] = address(0);
        inventory.tokenIds[foundIndex] = 0;
    }

    /**
     * @notice Adds experience to a specific NFT in user's inventory
     * @dev Transfers experience from global pool to NFT-specific pool
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to receive experience
     */
    function addNFTExperience(address nftContract, uint256 tokenId) external {
        validateShapeXpNFTOwnership();
        validateNFTOwnership(nftContract, tokenId);
        _validateNFTInInventory(msg.sender, nftContract, tokenId);

        uint256 amount = TRANSFER_EXPERIENCE_AMOUNT;
        _validateGlobalExperienceBalance(amount);

        _transferExperienceToNFT(nftContract, tokenId);
    }

    // =======================
    // EXTERNAL VIEW FUNCTIONS
    // =======================

    /**
     * @notice Checks if a user has a specific NFT in their inventory
     * @param user Address of the user
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return bool True if NFT is in user's inventory
     */
    function hasNFT(address user, address nftContract, uint256 tokenId) external view returns (bool) {
        UserInventory storage inventory = s_userInventories[user];
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == nftContract && inventory.tokenIds[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Gets user's global experience balance
     * @param user Address of the user
     * @return uint256 Amount of global experience
     */
    function getGlobalExperience(address user) external view returns (uint256) {
        return s_userGlobalExperience[user];
    }

    /**
     * @notice Gets experience accumulated for a specific NFT
     * @param user Address of the user
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return uint256 Amount of NFT-specific experience
     */
    function getNFTExperience(address user, address nftContract, uint256 tokenId) external view returns (uint256) {
        bytes32 nftKey = _generateNFTKey(nftContract, tokenId);
        return s_userNFTExperience[user][nftKey].experience;
    }

    /**
     * @notice Retrieves a user's NFT inventory
     * @param user Address of the user
     * @return address[] Array of NFT contract addresses
     * @return uint256[] Array of corresponding token IDs
     */
    function viewInventory(address user) external view returns (address[3] memory, uint256[3] memory) {
        return (s_userInventories[user].nftContracts, s_userInventories[user].tokenIds);
    }

    // =====================
    // PUBLIC VIEW FUNCTIONS
    // =====================

    /**
     * @dev Validates user owns ShapeXpNFT token
     */
    function validateShapeXpNFTOwnership() public view {
        if (s_shapeNFTCtr.balanceOf(msg.sender) == 0) {
            revert ShapeXpInvExp__NotShapeXpNFTOwner();
        }
    }

    /**
     * @dev Validates user owns specified NFT
     */
    function validateNFTOwnership(address NFTCtr, uint256 tokenId) public view {
        IERC721 inputNFT = IERC721(NFTCtr);
        if (inputNFT.ownerOf(tokenId) != msg.sender) revert ShapeXpInvExp__NotNFTOwner();
    }

    /**
     * @dev Ensures NFT is not ShapeXpNFT
     */
    function validateNonShapeXpNFT(address NFTCtr) public view {
        if (NFTCtr == address(s_shapeNFTCtr)) {
            revert ShapeXpInvExp__InvalidShapeXpContract();
        }
    }

    // =================
    // PRIVATE FUNCTIONS
    // =================

    /**
     * @dev Validates and updates user's cooldown status
     */
    function _validateCooldownPeriod() private {
        UserCooldown storage cooldown = s_userCooldowns[msg.sender];

        if (cooldown.isOnCooldown) {
            uint256 timePassed = block.timestamp - cooldown.lastExperienceGain;
            if (timePassed < COOLDOWN_PERIOD) {
                revert ShapeXpInvExp__OnCooldown(COOLDOWN_PERIOD - timePassed);
            }
        }

        cooldown.lastExperienceGain = block.timestamp;
        cooldown.isOnCooldown = true;
    }

    /**
     * @dev Handles the transfer of experience from global to NFT-specific pool
     */
    function _transferExperienceToNFT(address nftContract, uint256 tokenId) private {
        bytes32 nftKey = _generateNFTKey(nftContract, tokenId);
        NFTExperience storage nftExp = s_userNFTExperience[msg.sender][nftKey];

        if (nftExp.targetNftContract == address(0)) {
            nftExp.targetNftContract = nftContract;
            nftExp.tokenId = tokenId;
            nftExp.experience = 0;
        }

        uint256 amount = TRANSFER_EXPERIENCE_AMOUNT;
        uint256 newTotal = nftExp.experience + amount;
        uint256 actualAmount = amount;

        if (newTotal > MAX_EXPERIENCE) {
            actualAmount = MAX_EXPERIENCE - nftExp.experience;
            newTotal = MAX_EXPERIENCE;
            emit ExperienceCappedNFT(msg.sender, amount, actualAmount);
        }

        s_userGlobalExperience[msg.sender] -= actualAmount;
        nftExp.experience = newTotal;
        nftExp.lastUpdateTimestamp = block.timestamp;

        emit ExperienceAdded(msg.sender, nftContract, tokenId, actualAmount, nftExp.experience);
        emit GlobalExperienceDeducted(msg.sender, actualAmount, s_userGlobalExperience[msg.sender]);
    }

    // ======================
    // PRIVATE VIEW FUNCTIONS
    // ======================

    /**
     * @dev Validates if an address implements the ERC721 interface
     * @param contractAddress Address to check
     * @return bool True if address implements ERC721
     */
    function _isERC721(address contractAddress) private view returns (bool) {
        try IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
            return isSupported;
        } catch {
            return false;
        }
    }

    /**
     * @dev Validates experience type is valid
     */
    function _validateExperienceType(ExperienceAmount expType) private view {
        if (!s_validExperienceTypes[expType]) {
            revert ShapeXpInvExp__InvalidExperienceType();
        }
    }

    /**
     * @dev Gets experience amount for given type
     * @param expType Experience amount tier
     * @return uint256 Amount of experience for the given tier
     */
    function _getExperienceAmount(ExperienceAmount expType) private view returns (uint256) {
        return s_experienceAmounts[expType];
    }

    /**
     * @dev Validates NFT exists in user's inventory
     */
    function _validateNFTInInventory(address user, address nftContract, uint256 tokenId) private view {
        if (!this.hasNFT(user, nftContract, tokenId)) revert ShapeXpInvExp__NotInInventory();
    }

    /**
     * @dev Validates user has sufficient global experience
     */
    function _validateGlobalExperienceBalance(uint256 amount) private view {
        if (s_userGlobalExperience[msg.sender] < amount) revert ShapeXpInvExp__InsufficientGlobalExperience();
    }

    // ======================
    // PRIVATE PURE FUNCTIONS
    // ======================

    /**
     * @dev Generates unique key for NFT experience tracking
     */
    function _generateNFTKey(address targetNftContract, uint256 tokenId) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(targetNftContract, tokenId));
    }
}
