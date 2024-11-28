// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title ShapeXpInvExp - NFT Experience and Inventory Management Contract
/// @notice Manages an inventory system where ShapeXP NFT holders can add other NFTs and track their experience points
/// @dev Requires users to own a ShapeXP NFT to access functionality. Each user can hold up to 3 NFTs in their inventory
contract ShapeXpInvExp {
    IERC721 private immutable s_shapeNFTCtr;

    // ==================== SHARED STRUCTS & MAPPINGS ====================
    struct UserInventory {
        address[3] nftContracts;
        uint256[3] tokenIds;
    }

    struct NFTExperience {
        address targetNftContract;
        uint256 tokenId;
        uint256 experience;
        uint256 lastUpdateTimestamp;
    }

    mapping(address => UserInventory) private s_userInventories;
    mapping(address => mapping(bytes32 => NFTExperience)) private s_userNFTExperience;

    // ==================== EVENTS ====================
    event ExperienceAdded(
        address indexed user,
        address indexed shapeXpNftCtr,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 newTotal
    );

    // ==================== ERRORS ====================
    // Inventory Errors
    error ShapeXpInvExp__InvalidERC721Contract();
    error ShapeXpInvExp__InvalidShapeXpContract();
    error ShapeXpInvExp__NotShapeXpNFTOwner();
    error ShapeXpInvExp__InventoryFull();
    error ShapeXpInvExp__NotNFTOwner();
    error ShapeXpInvExp__NFTAlreadyInInventory();
    error ShapeXpInvExp__NFTNotInInventory();

    // Experience Errors
    error ShapeXpInvExp__NotInInventory();
    error ShapeXpInvExp__InvalidAmount();

    /// @notice Creates a new ShapeXpInvExp contract
    /// @param shapeNFTCtr Address of the ShapeXP NFT contract that gates access to this system
    /// @dev Validates that the provided address is a valid ERC721 contract
    constructor(address shapeNFTCtr) {
        if (shapeNFTCtr == address(0) || !_isERC721(shapeNFTCtr)) {
            revert ShapeXpInvExp__InvalidERC721Contract();
        }
        s_shapeNFTCtr = IERC721(shapeNFTCtr);
    }

    // ==================== COMMON UTILITY FUNCTIONS ====================
    function _isERC721(address contractAddress) private view returns (bool) {
        try IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
            return isSupported;
        } catch {
            return false;
        }
    }
    /// @notice Checks if the caller owns a ShapeXP NFT
    /// @dev Reverts if caller has zero ShapeXP NFTs
    function revertNonShapeXpNFTOwner() public view {
        if (s_shapeNFTCtr.balanceOf(msg.sender) == 0) {
            revert ShapeXpInvExp__NotShapeXpNFTOwner();
        }
    }

    function getTokenContract() external view returns (address) {
        return address(s_shapeNFTCtr);
    }

    // ==================== SECTION 1: INVENTORY FUNCTIONALITY ====================
    function revertIfNotNFTOwner(address NFTCtr, uint256 tokenId) public view {
        IERC721 inputNFT = IERC721(NFTCtr);
        if (inputNFT.ownerOf(tokenId) != msg.sender) revert ShapeXpInvExp__NotNFTOwner();
    }

    function revertIfAddingShapeXpNFTtoInv(address NFTCtr) public view {
        if (NFTCtr == address(s_shapeNFTCtr)) {
            revert ShapeXpInvExp__InvalidShapeXpContract();
        }
    }

    /// @notice Adds an NFT to the user's inventory
    /// @param NFTCtr The contract address of the NFT to add
    /// @param tokenId The token ID of the NFT to add
    /// @dev User must own a ShapeXP NFT and the target NFT. Inventory limited to 3 slots
    /// @dev Cannot add ShapeXP NFTs to inventory
    function addNFTToInventory(address NFTCtr, uint256 tokenId) external {
        revertNonShapeXpNFTOwner();
        revertIfNotNFTOwner(NFTCtr, tokenId);
        revertIfAddingShapeXpNFTtoInv(NFTCtr);

        UserInventory storage inventory = s_userInventories[msg.sender];

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == NFTCtr && inventory.tokenIds[i] == tokenId) {
                revert ShapeXpInvExp__NFTAlreadyInInventory();
            }
        }

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == address(0)) {
                inventory.nftContracts[i] = NFTCtr;
                inventory.tokenIds[i] = tokenId;
                return;
            }
        }

        revert ShapeXpInvExp__InventoryFull();
    }

    /// @notice Removes an NFT from the user's inventory
    /// @param NFTCtr The contract address of the NFT to remove
    /// @param tokenId The token ID of the NFT to remove
    /// @dev Also resets any accumulated experience for the NFT
    function removeNFTFromInventory(address NFTCtr, uint256 tokenId) external {
        revertNonShapeXpNFTOwner();
        revertIfNotNFTOwner(NFTCtr, tokenId);

        UserInventory storage inventory = s_userInventories[msg.sender];
        bool found = false;
        uint256 foundIndex;

        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == NFTCtr && inventory.tokenIds[i] == tokenId) {
                found = true;
                foundIndex = i;
                break;
            }
        }

        if (!found) {
            revert ShapeXpInvExp__NFTNotInInventory();
        }

        // Reset experience data
        bytes32 nftKey = _createNFTKey(NFTCtr, tokenId);
        NFTExperience storage nftExp = s_userNFTExperience[msg.sender][nftKey];
        nftExp.targetNftContract = address(0);
        nftExp.tokenId = 0;
        nftExp.experience = 0;
        nftExp.lastUpdateTimestamp = 0;

        // Remove from inventory
        inventory.nftContracts[foundIndex] = address(0);
        inventory.tokenIds[foundIndex] = 0;
    }

    /// @notice Views the NFTs in a user's inventory
    /// @param user Address of the user whose inventory to view
    /// @return Two arrays: NFT contract addresses and their corresponding token IDs
    function viewInventory(address user) external view returns (address[3] memory, uint256[3] memory) {
        return (s_userInventories[user].nftContracts, s_userInventories[user].tokenIds);
    }

    function hasNFT(address user, address nftContract, uint256 tokenId) external view returns (bool) {
        UserInventory storage inventory = s_userInventories[user];
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == nftContract && inventory.tokenIds[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    // ==================== SECTION 2: EXPERIENCE FUNCTIONALITY ====================
    /// @notice Creates a unique key for NFT experience tracking
    /// @param targetNftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @return bytes32 A unique hash combining contract address and token ID
    /// @dev Used internally to create keys for the userNFTExperience mapping
    function _createNFTKey(address targetNftContract, uint256 tokenId) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(targetNftContract, tokenId));
    }

    function _verifyNFTOwnership(address targetNftContract, uint256 tokenId) private view {
        IERC721 nft = IERC721(targetNftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert ShapeXpInvExp__NotNFTOwner();
        }
    }

    /// @notice Adds experience points to an NFT in the user's inventory
    /// @param targetNftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @param amount Amount of experience to add
    /// @dev NFT must be in user's inventory and user must own both ShapeXP NFT and target NFT
    /// @dev Emits ExperienceAdded event
    function addExperience(
        address targetNftContract,
        uint256 tokenId,
        uint256 amount
    ) external {
        revertNonShapeXpNFTOwner();
        _verifyNFTOwnership(targetNftContract, tokenId);

        if (!this.hasNFT(msg.sender, targetNftContract, tokenId)) {
            revert ShapeXpInvExp__NotInInventory();
        }

        if (amount == 0) {
            revert ShapeXpInvExp__InvalidAmount();
        }

        bytes32 nftKey = _createNFTKey(targetNftContract, tokenId);
        NFTExperience storage nftExp = s_userNFTExperience[msg.sender][nftKey];

        if (nftExp.targetNftContract == address(0)) {
            nftExp.targetNftContract = targetNftContract;
            nftExp.tokenId = tokenId;
            nftExp.experience = 0;
        }

        nftExp.experience += amount;
        nftExp.lastUpdateTimestamp = block.timestamp;

        emit ExperienceAdded(
            msg.sender,
            targetNftContract,
            tokenId,
            amount,
            nftExp.experience
        );
    }

    /// @notice Gets the current experience points for a specific NFT
    /// @param user The address of the NFT owner
    /// @param targetNftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @return uint256 The current experience points of the NFT
    function getNFTExperience(
        address user,
        address targetNftContract,
        uint256 tokenId
    ) external view returns (uint256) {
        bytes32 nftKey = _createNFTKey(targetNftContract, tokenId);
        return s_userNFTExperience[user][nftKey].experience;
    }
}
