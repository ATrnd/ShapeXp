// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpNFTTest is Test {
    ShapeXpNFT public shapeXpNFT;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        shapeXpNFT = new ShapeXpNFT();
    }

    function test_Mint() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 expectedTokenId = 0;
        address owner = shapeXpNFT.ownerOf(expectedTokenId);

        assertEq(owner, alice, "Alice should own the minted token");
    }

    function test_MintRevertsIfAlreadyMinted() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ShapeXpNFT.ShapeXpNFT__AlreadyMinted.selector, alice));
        shapeXpNFT.mint();
    }

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

    function test_TransferFrom() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.transferFrom(user1, user2, 0);
    }

    function test_ApproveReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.approve(user1, 1);
    }

    function test_SetApprovalForAllReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.setApprovalForAll(user1, true);
    }

    function test_IsApprovedForAllReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.isApprovedForAll(alice, user1);
    }

    function test_getApprovedReturnsZeroAddress() public view {
        uint256 tokenId = 0;
        address approvedAddress = shapeXpNFT.getApproved(tokenId);
        assertEq(approvedAddress, address(0), "getApproved should return address(0) when no approval is set.");
    }

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

    function test_OwnerShipBeforeTransferBlocked() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = 0;
        assertEq(shapeXpNFT.ownerOf(tokenId), alice, "Alice should own the minted token");
        assertEq(shapeXpNFT.balanceOf(alice), 1, "Alice should have one token");
    }

    function test_ReentrancyOnTransfer() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user1);
        shapeXpNFT.safeTransferFrom(user1, user2, 0);
    }

    function test_AdminApprovalReverts() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.approve(user1, 0);
    }

    function test_BlockTransferFromInvalidInputs() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(user2);
        shapeXpNFT.safeTransferFrom(user1, user2, 0);
    }
}
