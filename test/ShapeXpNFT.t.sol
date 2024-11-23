// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";

contract ShapeXpNFTTest is Test {
    ShapeXpNFT public shapeXpNFT;
    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    /**
     * @notice Sets up the ShapeXpNFT contract instance for testing.
     */
    function setUp() public {
        shapeXpNFT = new ShapeXpNFT();
    }

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
}
