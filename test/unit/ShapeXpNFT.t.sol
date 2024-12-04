// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpNFTTest is Test {
    ShapeXpNFT public shapeXpNFT;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    event ShapeXpNFTMinted(address indexed user, uint256 indexed tokenId);

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

    function test_MultipleUsersCanMint() public {
        uint256 expectedTokens = 5;
        address[] memory users = new address[](expectedTokens);

        // Create users and mint tokens
        for (uint256 i = 0; i < expectedTokens; i++) {
            users[i] = makeAddr(string.concat("user", vm.toString(i)));
            vm.prank(users[i]);
            shapeXpNFT.mint();

            // Verify ownership
            assertEq(shapeXpNFT.ownerOf(i), users[i], "User should own their minted token");
            assertEq(shapeXpNFT.balanceOf(users[i]), 1, "User should have exactly one token");
        }
    }

    function test_BalanceAfterMint() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        assertEq(shapeXpNFT.balanceOf(alice), 1, "Balance should be 1 after minting");
        assertEq(shapeXpNFT.balanceOf(user1), 0, "Balance should be 0 for non-minter");
    }

    function test_RevertOnNonexistentTokenURI() public {
        vm.expectRevert();
        shapeXpNFT.tokenURI(999);
    }

    function test_NameAndSymbol() public view {
        string memory expectedName = "ShapeXpNFT";
        string memory expectedSymbol = "SXP";

        assertEq(shapeXpNFT.name(), expectedName, "Contract name should match");
        assertEq(shapeXpNFT.symbol(), expectedSymbol, "Contract symbol should match");
    }

    function test_RevertOnZeroAddressTransfer() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(alice);
        shapeXpNFT.safeTransferFrom(alice, address(0), 0);
    }

    function test_RevertOnSelfTransfer() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(alice);
        shapeXpNFT.safeTransferFrom(alice, alice, 0);
    }

    function test_RevertOnNonexistentTokenTransfer() public {
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__TransfersNotAllowed.selector);
        vm.prank(alice);
        shapeXpNFT.safeTransferFrom(alice, user1, 999);
    }

    function test_ConsecutiveMintAttempts() public {
        vm.startPrank(alice);

        // First mint should succeed
        shapeXpNFT.mint();
        assertEq(shapeXpNFT.ownerOf(0), alice, "First mint should succeed");

        // Second mint should fail
        vm.expectRevert(abi.encodeWithSelector(ShapeXpNFT.ShapeXpNFT__AlreadyMinted.selector, alice));
        shapeXpNFT.mint();

        // Third mint should also fail
        vm.expectRevert(abi.encodeWithSelector(ShapeXpNFT.ShapeXpNFT__AlreadyMinted.selector, alice));
        shapeXpNFT.mint();

        vm.stopPrank();
    }

    function test_SupportsInterface() public view {
        // ERC721 interface ID
        bytes4 erc721InterfaceId = 0x80ac58cd;
        // ERC165 interface ID
        bytes4 erc165InterfaceId = 0x01ffc9a7;

        assert(shapeXpNFT.supportsInterface(erc721InterfaceId));
        assert(shapeXpNFT.supportsInterface(erc165InterfaceId));
    }

    function test_RevertOnApproveNonexistentToken() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpNFT.ShapeXpNFT__ApprovalNotAllowed.selector);
        shapeXpNFT.approve(user1, 999);
    }

    function test_GetApprovedNonexistentToken() public view {
        address approvedAddr = shapeXpNFT.getApproved(999);
        assertEq(approvedAddr, address(0), "Approved address should be zero the address");
    }

    function test_HasMintedToken() public {
        // Check before minting
        assertEq(shapeXpNFT.hasMintedToken(alice), false, "Should return false before minting");

        // Mint token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Check after minting
        assertEq(shapeXpNFT.hasMintedToken(alice), true, "Should return true after minting");
        assertEq(shapeXpNFT.hasMintedToken(user1), false, "Should return false for non-minter");
    }

    function test_EmitsMintEvent() public {
        vm.prank(alice);

        vm.expectEmit();
        emit ShapeXpNFTMinted(alice, 0);

        shapeXpNFT.mint();
    }

    function test_MultipleMintsEmitCorrectTokenIds() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, false);
        emit ShapeXpNFTMinted(alice, 0);
        shapeXpNFT.mint();

        // Second mint with different user
        vm.prank(user1);
        vm.expectEmit(true, true, false, false);
        emit ShapeXpNFTMinted(user1, 1);
        shapeXpNFT.mint();
    }

    function test_HasMintedTokenForMultipleUsers() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(user1);
        shapeXpNFT.mint();

        assertEq(shapeXpNFT.hasMintedToken(alice), true, "First user should show as minted");
        assertEq(shapeXpNFT.hasMintedToken(user1), true, "Second user should show as minted");
        assertEq(shapeXpNFT.hasMintedToken(user2), false, "Non-minter should show as not minted");
    }
}
