// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ShapeXpNFT
 * @notice A non-transferable (soulbound) NFT that grants access to the ShapeXp experience system
 * @dev Implements:
 * - One NFT per address limit
 * - Non-transferable token mechanics
 * - Sequential token ID assignment
 * - Disabled approval mechanisms
 * @custom:security-contact atrnd.work@gmail.com
 */
contract ShapeXpNFT is ERC721 {
    // ======
    // EVENTS
    // ======

    /**
     * @dev Emitted when a new token is minted
     * @param user Address of the token recipient
     * @param tokenId ID of the minted token
     */
    event ShapeXpNFTMinted(address indexed user, uint256 indexed tokenId);

    // ======
    // ERRORS
    // ======

    /// @dev Thrown when an address attempts to mint more than one token
    /// @param minter The address that attempted to mint again
    error ShapeXpNFT__AlreadyMinted(address minter);

    /// @dev Thrown when any transfer of tokens is attempted
    error ShapeXpNFT__TransfersNotAllowed();

    /// @dev Thrown when any approval operation is attempted
    error ShapeXpNFT__ApprovalNotAllowed();

    // ===============
    // STATE VARIABLES
    // ===============

    /// @dev Tracks the next token ID to be minted, increments sequentially
    uint256 private s_nextTokenId;

    /// @dev Maps user address to their minting status
    /// @notice True if address has already minted their token
    mapping(address => bool) private hasMinted;

    // ===========
    // CONSTRUCTOR
    // ===========

    /**
     * @notice Initializes the soulbound NFT contract
     * @dev Sets up ERC721 with name "ShapeXpNFT" and symbol "SXP"
     */
    constructor() ERC721("ShapeXpNFT", "SXP") {}

    // ==================
    // EXTERNAL FUNCTIONS
    // ==================

    /**
     * @notice Allows users to mint their unique ShapeXp NFT
     * @dev Enforces one token per address limit
     * @dev Uses _safeMint to prevent minting to non-receiver contracts
     */
    function mint() external {
        if (hasMinted[msg.sender]) revert ShapeXpNFT__AlreadyMinted(msg.sender);
        uint256 tokenId = s_nextTokenId;
        _safeMint(msg.sender, s_nextTokenId);
        hasMinted[msg.sender] = true;
        s_nextTokenId++;

        emit ShapeXpNFTMinted(msg.sender, tokenId);
    }

    // ===================
    // DISABLED FUNCTIONS
    // ===================

    /**
     * @notice Disabled - tokens are soulbound
     * @dev Overrides ERC721 safeTransferFrom
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /**
     * @notice Disabled - tokens are soulbound
     * @dev Overrides ERC721 transferFrom
     */
    function transferFrom(address, address, uint256) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /**
     * @notice Disabled - tokens are soulbound
     * @dev Overrides ERC721 approve
     */
    function approve(address, uint256) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    /**
     * @notice Disabled - tokens are soulbound
     * @dev Overrides ERC721 setApprovalForAll
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    // =====================
    // PUBLIC VIEW FUNCTIONS
    // =====================

    /**
     * @notice Checks if an address has already minted their token
     * @param user Address to check
     * @return bool True if the address has minted, false otherwise
     */
    function hasMintedToken(address user) public view returns (bool) {
        return hasMinted[user];
    }

    /**
     * @notice Always returns zero address as approvals are disabled
     * @dev Overrides ERC721 getApproved
     * @return address The zero address, as approvals are not possible
     */
    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    /**
     * @notice Always reverts as approvals are disabled
     * @dev Overrides ERC721 isApprovedForAll
     */
    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }
}
