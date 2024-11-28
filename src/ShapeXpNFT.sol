pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title ShapeXpNFT - Soulbound NFT for ShapeXp System Access
/// @notice A non-transferable NFT that grants access to the ShapeXp experience system
/// @dev Inherits from OpenZeppelin's ERC721 but overrides transfer functions to make tokens soulbound
contract ShapeXpNFT is ERC721 {

    /// @notice Thrown when an address attempts to mint more than one token
    /// @param minter The address that attempted to mint again
    error ShapeXpNFT__AlreadyMinted(address minter);

    /// @notice Thrown when any transfer of tokens is attempted
    error ShapeXpNFT__TransfersNotAllowed();

    /// @notice Thrown when any approval operation is attempted
    error ShapeXpNFT__ApprovalNotAllowed();

    /// @notice Initializes the contract with name "ShapeXpNFT" and symbol "SXP"
    constructor() ERC721("ShapeXpNFT", "SXP") {}

    /// @dev Tracks the next token ID to be minted
    uint256 private s_nextTokenId;

    /// @dev Tracks whether an address has already minted their token
    mapping(address => bool) private hasMinted;

    /// @notice Allows an address to mint their unique ShapeXp NFT
    /// @dev Each address can only mint once. Token IDs are sequential
    /// @dev Uses safeMint to prevent minting to contracts that can't handle NFTs
    function mint() external {
        if (hasMinted[msg.sender]) revert ShapeXpNFT__AlreadyMinted(msg.sender);
        _safeMint(msg.sender, s_nextTokenId);
        hasMinted[msg.sender] = true;
        s_nextTokenId++;
    }

    /// @notice Disabled - tokens cannot be transferred
    /// @dev Overrides standard ERC721 safeTransferFrom
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /// @notice Disabled - tokens cannot be transferred
    /// @dev Overrides standard ERC721 transferFrom
    function transferFrom(address, address, uint256) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /// @notice Disabled - tokens cannot be approved for transfer
    /// @dev Overrides standard ERC721 approve
    function approve(address, uint256) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    /// @notice Disabled - tokens cannot be approved for transfer
    /// @dev Overrides standard ERC721 setApprovalForAll
    function setApprovalForAll(address, bool) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    /// @notice Always returns zero address as approvals are disabled
    /// @dev Overrides standard ERC721 getApproved
    /// @return address The zero address
    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    /// @notice Disabled - tokens cannot be approved for transfer
    /// @dev Overrides standard ERC721 isApprovedForAll
    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }
}
