// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

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
    mapping(address => uint256) private s_userGlobalExperience;

    // ==================== EVENTS ====================
    event ExperienceAdded(
        address indexed user,
        address indexed shapeXpNftCtr,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 newTotal
    );

    event GlobalExperienceAdded(address indexed user, uint256 amount, uint256 newTotal);
    event GlobalExperienceDeducted(address indexed user, uint256 amount, uint256 remaining);

    // ==================== ERRORS ====================
    // Inventory Errors
    error ShapeXpInvExp__InvalidERC721Contract();
    error ShapeXpInvExp__InvalidShapeXpContract();
    error ShapeXpInvExp__NotShapeXpNFTOwner();
    error ShapeXpInvExp__InventoryFull();
    error ShapeXpInvExp__NotNFTOwner();
    error ShapeXpInvExp__NFTAlreadyInInventory();
    error ShapeXpInvExp__NFTNotInInventory();
    error ShapeXpInvExp__InsufficientGlobalExperience();

    // Experience Errors
    error ShapeXpInvExp__NotInInventory();
    error ShapeXpInvExp__InvalidAmount();

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
    function addGlobalExperience(uint256 amount) external {
        revertNonShapeXpNFTOwner();
        if (amount == 0) {
            revert ShapeXpInvExp__InvalidAmount();
        }

        s_userGlobalExperience[msg.sender] += amount;
        emit GlobalExperienceAdded(msg.sender, amount, s_userGlobalExperience[msg.sender]);
    }

    function _createNFTKey(address targetNftContract, uint256 tokenId) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(targetNftContract, tokenId));
    }

    function _verifyNFTOwnership(address targetNftContract, uint256 tokenId) private view {
        IERC721 nft = IERC721(targetNftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert ShapeXpInvExp__NotNFTOwner();
        }
    }

   // Modify addExperience to use global experience pool
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

        // Check global experience balance
        if (s_userGlobalExperience[msg.sender] < amount) {
            revert ShapeXpInvExp__InsufficientGlobalExperience();
        }

        // Deduct from global experience
        s_userGlobalExperience[msg.sender] -= amount;

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
        emit GlobalExperienceDeducted(msg.sender, amount, s_userGlobalExperience[msg.sender]);
    }

    // View function for global experience
    function getGlobalExperience(address user) external view returns (uint256) {
        return s_userGlobalExperience[user];
    }

    function getNFTExperience(
        address user,
        address targetNftContract,
        uint256 tokenId
    ) external view returns (uint256) {
        bytes32 nftKey = _createNFTKey(targetNftContract, tokenId);
        return s_userNFTExperience[user][nftKey].experience;
    }
}
