pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title ShapeXpAUX
 * @dev A contract that verifies ownership of ShapeXpNFT tokens.
 */
contract ShapeXpAUX {
    /// @dev Address of the ERC721 contract to validate.
    IERC721 private immutable s_tokenContract;

    /**
     * @dev Custom error emitted when the provided ERC721 contract is invalid.
     */
    error ShapeXpAUX__InvalidERC721Contract();

    /**
     * @dev Custom error emitted when the caller does not own any tokens.
     */
    error ShapeXpAUX__NotATokenOwner();

    /**
     * @dev Initializes the contract with the address of the ERC721 implementation.
     * @param tokenContract Address of the ERC721 contract to verify.
     *
     * Requirements:
     * - `tokenContract` must support the ERC721 interface.
     */
    constructor(address tokenContract) {
        if (tokenContract == address(0) || !_isERC721(tokenContract)) revert ShapeXpAUX__InvalidERC721Contract();
        s_tokenContract = IERC721(tokenContract);
    }

    /**
     * @dev Ensures the caller owns at least one token from the ERC721 contract.
     *
     * Requirements:
     * - Caller must own at least one token from the registered ERC721 contract.
     */
    modifier onlyTokenOwner() {
        if (s_tokenContract.balanceOf(msg.sender) == 0) revert ShapeXpAUX__NotATokenOwner();
        _;
    }

    /**
     * @notice Checks if the provided address is a valid ERC721 contract.
     * @param contractAddress Address to check.
     * @return True if the address supports the ERC721 interface, false otherwise.
     */
    function _isERC721(address contractAddress) private view returns (bool) {
        try IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
            return isSupported;
        } catch {
            return false;
        }
    }

    /**
     * @notice Example function restricted to token owners.
     * @dev This function can only be called by users who own tokens in the registered ERC721 contract.
     * @return A simple success message.
     */
    function restrictedAction() external view onlyTokenOwner returns (string memory) {
        return "Access granted: You own a ShapeXpNFT!";
    }

    /**
     * @notice Returns the address of the ERC721 token contract used for validation.
     */
    function getTokenContract() external view returns (address) {
        return address(s_tokenContract);
    }
}
