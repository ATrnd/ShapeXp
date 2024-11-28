// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockInvalidContract} from "../mock/MockInvalidContract.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpInvTest is Test {
    MockERC721 public mockERC721;
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
    }

    // ============ Constructor Tests ============
    function test_RevertWhen_ConstructorZeroAddress() public {
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidERC721Contract.selector);
        new ShapeXpInvExp(address(0));
    }

    function test_RevertWhen_ConstructorInvalidContract() public {
        address invalidERC721 = address(new MockInvalidContract());
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidERC721Contract.selector);
        new ShapeXpInvExp(invalidERC721);
    }

    function test_SuccessfulConstruction() public {
        ShapeXpInvExp shapeXpInvCtr = new ShapeXpInvExp(address(shapeXpNFT));
        assertEq(shapeXpInvCtr.getTokenContract(), address(shapeXpNFT));
    }

    // ============ Basic Getters Tests ============
    function test_GetTokenContract() public view {
        assertEq(shapeXpInvExp.getTokenContract(), address(shapeXpNFT));
    }

    // ============ NFT Ownership Tests ============
    function test_RevertWhen_NonShapeXpNFTOwner() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.revertNonShapeXpNFTOwner();
    }

    function test_SuccessWhen_ShapeXpNFTOwner() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.prank(user1);
        shapeXpInvExp.revertNonShapeXpNFTOwner();
    }

    function test_RevertWhen_NotNFTOwner() public {
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.revertIfNotNFTOwner(address(mockERC721), tokenId);
    }

    function test_SuccessWhen_NFTOwner() public {
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInvExp.revertIfNotNFTOwner(address(mockERC721), tokenId);
    }

    // ============ Inventory Addition Tests ============
    function test_RevertWhen_AddingShapeXpNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidShapeXpContract.selector);
        shapeXpInvExp.addNFTToInventory(address(shapeXpNFT), 0);
    }

    function test_RevertWhen_AddingWithoutShapeXpToken() public {
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
    }

    function test_RevertWhen_AddingUnownedNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
    }

    function test_RevertWhen_AddingDuplicateNFT() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NFTAlreadyInInventory.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        vm.stopPrank();
    }

    function test_RevertWhen_InventoryFull() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();

        uint256[] memory tokenIds = new uint256[](4);
        for (uint256 i = 0; i < 4; i++) {
            tokenIds[i] = mockERC721.mint(alice);
        }

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIds[0]);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIds[1]);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIds[2]);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InventoryFull.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIds[3]);
        vm.stopPrank();
    }

    function test_SuccessfulInventoryAddition() public {
        vm.startPrank(alice);
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpNFT.mint();

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        (address[3] memory nftContracts, uint256[3] memory tokenIds) = shapeXpInvExp.viewInventory(alice);
        assertEq(nftContracts[0], address(mockERC721), "First NFT contract should match");
        assertEq(tokenIds[0], tokenId, "First token ID should match");
        vm.stopPrank();
    }

    // ============ Inventory Removal Tests ============
    function test_RevertWhen_RemovingWithoutShapeXpToken() public {
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
    }

    function test_RevertWhen_RemovingUnownedNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
    }

    function test_RevertWhen_RemovingNFTNotInInventory() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NFTNotInInventory.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        vm.stopPrank();
    }

    function test_SuccessfulInventoryRemoval() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);

        (address[3] memory contracts, uint256[3] memory tokenIds) = shapeXpInvExp.viewInventory(alice);
        assertEq(contracts[0], address(0), "NFT contract should be zero address after removal");
        assertEq(tokenIds[0], 0, "Token ID should be zero after removal");
        vm.stopPrank();
    }

    function test_SuccessfulRemovalFromDifferentPositions() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();

        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            tokenIds[i] = mockERC721.mint(alice);
            shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIds[i]);
        }

        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenIds[1]);

        (address[3] memory contracts, uint256[3] memory ids) = shapeXpInvExp.viewInventory(alice);

        assertEq(contracts[0], address(mockERC721), "First NFT should remain");
        assertEq(ids[0], tokenIds[0], "First token ID should remain");

        assertEq(contracts[1], address(0), "Middle slot should be empty");
        assertEq(ids[1], 0, "Middle token ID should be zero");

        assertEq(contracts[2], address(mockERC721), "Last NFT should remain");
        assertEq(ids[2], tokenIds[2], "Last token ID should remain");
        vm.stopPrank();
    }

    // ============ Multiple Users Tests ============
    function test_MultipleUsersOwnership() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.prank(user2);
        shapeXpNFT.mint();

        vm.prank(user1);
        shapeXpInvExp.revertNonShapeXpNFTOwner();

        vm.prank(user2);
        shapeXpInvExp.revertNonShapeXpNFTOwner();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.revertNonShapeXpNFTOwner();
    }
}
