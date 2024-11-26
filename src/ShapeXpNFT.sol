pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ShapeXpNFT is ERC721 {

    error ShapeXpNFT__AlreadyMinted(address minter);
    error ShapeXpNFT__TransfersNotAllowed();
    error ShapeXpNFT__ApprovalNotAllowed();

    constructor() ERC721("ShapeXpNFT", "SXN") {}

    uint256 private s_nextTokenId;
    mapping(address => bool) private hasMinted;

    function mint() external {
        if (hasMinted[msg.sender]) revert ShapeXpNFT__AlreadyMinted(msg.sender);
        _safeMint(msg.sender, s_nextTokenId);
        hasMinted[msg.sender] = true;
        s_nextTokenId++;
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    function transferFrom(address, address, uint256) public virtual override {
        revert ShapeXpNFT__TransfersNotAllowed();
    }

    function approve(address, uint256) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }

    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        revert ShapeXpNFT__ApprovalNotAllowed();
    }
}
