// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title MockERC721
 * @dev A mock ERC721 implementation for testing purposes. This contract allows minting of tokens.
 */
contract MockERC721 is ERC721 {
    uint256 private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    /**
     * @dev Mints a new token to the specified address.
     * @param to The address to mint the token to.
     * @return The token ID of the newly minted token.
     */
    function mint(address to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        return tokenId;
    }
}
