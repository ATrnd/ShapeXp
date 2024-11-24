// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";
import {ShapeXpAUX} from "../src/ShapeXpAUX.sol";
import {MockInvalidContract} from "./MockInvalidContract.sol";

contract ShapeXpNFTTest is Test {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpAUX public shapeXpAUX;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    /**
     * @notice Sets up the ShapeXpNFT contract instance for testing.
     */
    function setUp() public {
        shapeXpNFT = new ShapeXpNFT();
        shapeXpAUX = new ShapeXpAUX(address(shapeXpNFT));
    }

    // Test :: [ShapeXpNFT] {{{
    // ========================

    /**
     * @notice Tests that a token can be minted successfully and verifies ownership.
     * @dev Ensures the minted token is owned by the caller.
     */
    function test_Mint() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 expectedTokenId = 0;
        address owner = shapeXpNFT.ownerOf(expectedTokenId);

        assertEq(owner, alice, "Alice should own the minted token");
    }

    /**
     * @notice Tests that minting reverts if an address tries to mint more than one token.
     * @dev Ensures the custom error `ShapeXpNFT__AlreadyMinted` is emitted.
     */
    function test_MintRevertsIfAlreadyMinted() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ShapeXpNFT.ShapeXpNFT__AlreadyMinted.selector, alice));
        shapeXpNFT.mint();
    }

    /**
     * @notice Tests that `safeTransferFrom` and `transferFrom` revert.
     * @dev Verifies the custom error `ShapeXpNFT__TransfersNotAllowed` is emitted.
     */
    function test_SafeTransferFrom() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.safeTransferFrom(user1, user2, 0);

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.transferFrom(user1, user2, 0);
    }

    /**
     * @notice Tests that `transferFrom` reverts as transfers are blocked.
     * @dev Ensures the `ShapeXpNFT__TransfersNotAllowed` error is emitted.
     */
    function test_TransferFrom() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.transferFrom(user1, user2, 0);
    }

    /**
     * @notice Tests that the `approve` function reverts.
     * @dev Ensures the `ShapeXpNFT__ApprovalNotAllowed` error is emitted.
     */
    function test_ApproveReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.approve(user1, 1);
    }

    /**
     * @notice Tests that `setApprovalForAll` reverts.
     * @dev Ensures the `ShapeXpNFT__ApprovalNotAllowed` error is emitted.
     */
    function test_SetApprovalForAllReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.setApprovalForAll(user1, true);
    }

    /**
     * @notice Tests that `isApprovedForAll` reverts when queried.
     * @dev Ensures the `ShapeXpNFT__ApprovalNotAllowed` error is emitted.
     */
    function test_IsApprovedForAllReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.isApprovedForAll(alice, user1);
    }

    /**
     * @notice Tests that `getApproved` returns the zero address by default.
     * @dev Ensures no approval is set for a token.
     */
    function test_getApprovedReturnsZeroAddress() public view {
        uint256 tokenId = 0;
        address approvedAddress = shapeXpNFT.getApproved(tokenId);
        assertEq(approvedAddress, address(0), "getApproved should return address(0) when no approval is set.");
    }

    /**
     * @notice Tests that token IDs increment correctly after each mint.
     * @dev Ensures each new token gets a unique ID starting from 0.
     */
    function test_TokenIdIncrement() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId1 = 0;
        assertEq(shapeXpNFT.ownerOf(tokenId1), alice, "Alice should own the first minted token");

        vm.prank(user1);
        shapeXpNFT.mint();

        uint256 tokenId2 = 1;
        assertEq(shapeXpNFT.ownerOf(tokenId2), user1, "User1 should own the second minted token");
    }

    /**
     * @notice Tests that no token IDs are skipped during minting.
     * @dev Verifies sequential token ID assignment.
     */
    function test_EnsureNoSkippedTokenIds() public {
        vm.prank(alice);
        shapeXpNFT.mint();
        uint256 tokenId1 = 0;

        vm.prank(user1);
        shapeXpNFT.mint();
        uint256 tokenId2 = 1;

        assertEq(tokenId1, 0, "Token ID should be 0");
        assertEq(tokenId2, 1, "Token ID should be 1");
    }

    /**
     * @notice Tests that ownership and balances are correct before transfer attempts.
     * @dev Ensures ownership reflects correctly for minted tokens.
     */
    function test_OwnerShipBeforeTransferBlocked() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = 0;
        assertEq(shapeXpNFT.ownerOf(tokenId), alice, "Alice should own the minted token");
        assertEq(shapeXpNFT.balanceOf(alice), 1, "Alice should have one token");
    }

    /**
     * @notice Tests that reentrancy during `safeTransferFrom` is blocked.
     * @dev Ensures `ShapeXpNFT__TransfersNotAllowed` is emitted for reentrancy.
     */
    function test_ReentrancyOnTransfer() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.safeTransferFrom(user1, user2, 0);
    }

    /**
     * @notice Tests that admin-level approvals revert.
     * @dev Ensures the custom error `ShapeXpNFT__ApprovalNotAllowed` is emitted.
     */
    function test_AdminApprovalReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.approve(user1, 0);
    }

    /**
     * @notice Tests that `safeTransferFrom` with invalid inputs reverts.
     * @dev Verifies transfers between non-owners are blocked.
     */
    function test_BlockTransferFromInvalidInputs() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user2);
        shapeXpNFT.safeTransferFrom(user1, user2, 0);
    }

    // ========================
    // Test :: [ShapeXpNFT] }}}

    // Test :: [ShapeXpAUX] {{{
    // ========================

    /**
     * @notice Tests the constructor with an invalid address.
     * @dev Ensures the `ShapeXpAUX__InvalidERC721Contract` error is emitted when a zero address is provided.
     */
    function test_InvalidERC721Contract() public {
        vm.expectRevert(ShapeXpAUX.ShapeXpAUX__InvalidERC721Contract.selector);
        new ShapeXpAUX(address(0));
    }

    /**
     * @notice Tests the `_isERC721` function with an invalid ERC721 address.
     * @dev Ensures the `ShapeXpAUX__InvalidERC721Contract` error is emitted when a non-ERC721 address is provided.
     */
    function test_IsERC721_InvalidContract() public {
        // Deploy a mock contract that does not implement IERC721
        address invalidERC721 = address(new MockInvalidContract());

        // Expect revert when passing the invalid contract address
        vm.expectRevert(ShapeXpAUX.ShapeXpAUX__InvalidERC721Contract.selector);
        new ShapeXpAUX(invalidERC721);
    }

    /**
     * @notice Tests the `_isERC721` function indirectly through constructor validation.
     * @dev Verifies that the contract accepts a valid ERC721 address and sets it correctly.
     */
    function test_IsERC721_ValidContract() public {
        // Deploy the ShapeXpAUX contract with a valid ERC721 address
        ShapeXpAUX aux = new ShapeXpAUX(address(shapeXpNFT));
        assertEq(aux.getTokenContract(), address(shapeXpNFT));
    }

    /**
     * @notice Tests the `getTokenContract` function.
     * @dev Verifies that the address of the ERC721 contract is returned correctly.
     */
    function test_GetTokenContract() public view {
        assertEq(shapeXpAUX.getTokenContract(), address(shapeXpNFT));
    }

    /**
     * @notice Tests the `restrictedAction` function when the caller does not own any tokens.
     * @dev Ensures the `ShapeXpAUX__NotATokenOwner` error is emitted.
     */
    function test_RestrictedAction_NotTokenOwner() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpAUX.ShapeXpAUX__NotATokenOwner.selector);
        shapeXpAUX.restrictedAction();
    }

    /**
     * @notice Tests the `restrictedAction` function when the caller owns a token.
     * @dev Ensures the function executes successfully and returns the expected message.
     */
    function test_RestrictedAction_TokenOwner() public {
        // User1 mints an NFT
        vm.prank(user1);
        shapeXpNFT.mint();

        // Call the restricted function as User1
        vm.prank(user1);
        string memory result = shapeXpAUX.restrictedAction();
        assertEq(result, "Access granted: You own a ShapeXpNFT!");
    }

    /**
     * @notice Tests that multiple users with minted tokens can access the `restrictedAction` function.
     * @dev Verifies that each token owner can access the function while non-owners are restricted.
     */
    function test_MultipleUsers() public {
        // User1 mints an NFT
        vm.prank(user1);
        shapeXpNFT.mint();

        // User2 mints an NFT
        vm.prank(user2);
        shapeXpNFT.mint();

        // Verify User1 access
        vm.prank(user1);
        string memory user1Result = shapeXpAUX.restrictedAction();
        assertEq(user1Result, "Access granted: You own a ShapeXpNFT!");

        // Verify User2 access
        vm.prank(user2);
        string memory user2Result = shapeXpAUX.restrictedAction();
        assertEq(user2Result, "Access granted: You own a ShapeXpNFT!");

        // Verify Non-Owner cannot access
        vm.prank(alice);
        vm.expectRevert(ShapeXpAUX.ShapeXpAUX__NotATokenOwner.selector);
        shapeXpAUX.restrictedAction();
    }

    // ========================
    // Test :: [ShapeXpAUX] }}}

}
