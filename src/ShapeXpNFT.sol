pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ShapeXpNFT
 * @dev An ERC721 token contract where each address can mint only one token.
 */
contract ShapeXpNFT is ERC721 {
    /**
     * @dev Custom error emitted when an address attempts to mint more than one token.
     * @param minter The address that attempted to mint again.
     */
    error ShapeXpNFT__AlreadyMinted(address minter);

    /**
     * @dev Custom error emitted when a transfer attempt is made.
     */
    error ShapeXpNFT__TransfersNotAllowed();

    /**
     * @dev Custom error emitted when an approval attempt is made.
     */
    error ShapeXpNFT__ApprovalNotAllowed();

    /**
     * @dev Initializes the contract with the token name and symbol.
     */
    constructor() ERC721("ShapeXpNFT", "SXN") {}

    /// @notice Tracks the ID of the next token to be minted.
    uint256 private s_nextTokenId;

    /// @dev Tracks whether an address has already minted a token.
    mapping(address => bool) private hasMinted;

    /**
     * @notice Mints a single token for the caller.
     * @dev Ensures that each address can mint only one token. Emits the `AlreadyMinted` error if called twice.
     *      Increments the `s_nextTokenId` after minting.
     *
     * Requirements:
     * - Caller must not have minted a token previously.
     */
    function mint() external {
        if (hasMinted[msg.sender]) revert ShapeXpNFT__AlreadyMinted(msg.sender);
        _safeMint(msg.sender, s_nextTokenId);
        hasMinted[msg.sender] = true;
        s_nextTokenId++;
    }

    /**
     * @dev Prevents transfer of tokens by reverting any attempts.
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /**
     * @dev Prevents transfer of tokens by reverting any attempts.
     */
    function transferFrom(address, address, uint256) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    /**
     * @dev Prevents approval for token transfers by reverting any attempts.
     */
    function approve(address, uint256) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    /**
     * @dev Prevents setting approval for all tokens by reverting any attempts.
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    /**
     * @dev Prevents getting the approved address for token transfers by reverting any attempts.
     */
    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    /**
     * @dev Prevents checking if an address is approved for all tokens by reverting any attempts.
     */
    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }
}
