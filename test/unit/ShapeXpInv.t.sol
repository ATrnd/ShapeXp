// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockInvalidContract} from "../mock/MockInvalidContract.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpInvTest is Test {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;
    MockERC721 public mockERC721;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");

    // Experience amount based on contract initialization
    uint256 private constant TRANSFER_EXPERIENCE_AMOUNT = 500;

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
    }

    /// @notice tests for : addNFTToInventory(address nftContract, uint256 tokenId) external {...}
    function test_AddNFTToInventory() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        vm.stopPrank();

        (address[3] memory contracts, uint256[3] memory tokens) = shapeXpInvExp.viewInventory(alice);
        assertEq(address(mockERC721), contracts[0]);
        assertEq(tokenId, tokens[0]);
    }

    function test_RevertAddNFTToInventoryNoShapeXp() public {
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
    }

    function test_RevertAddNFTToInventoryNotOwner() public {
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
    }

    function test_RevertAddShapeXpNFTToInventory() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = 0;

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidShapeXpContract.selector);
        shapeXpInvExp.addNFTToInventory(address(shapeXpNFT), tokenId);
        vm.stopPrank();
    }

    function test_RevertAddDuplicateNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.startPrank(alice);
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NFTAlreadyInInventory.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        vm.stopPrank();
    }

    function test_RevertInventoryFull() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId1 = mockERC721.mint(alice);
        uint256 tokenId2 = mockERC721.mint(alice);
        uint256 tokenId3 = mockERC721.mint(alice);
        uint256 tokenId4 = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId2);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId3);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InventoryFull.selector);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId4);
        vm.stopPrank();
    }

    function test_AddMultipleNFTs() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId1 = mockERC721.mint(alice);
        uint256 tokenId2 = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId2);

        (address[3] memory contracts, uint256[3] memory tokens) = shapeXpInvExp.viewInventory(alice);
        assertEq(contracts[0], address(mockERC721));
        assertEq(contracts[1], address(mockERC721));
        assertEq(tokens[0], tokenId1);
        assertEq(tokens[1], tokenId2);
        vm.stopPrank();
    }

    /// @notice tests for : removeNFTFromInventory(address nftContract, uint256 tokenId) external {...}
    function test_RemoveNFTFromInventory() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        vm.stopPrank();

        (address[3] memory contracts, uint256[3] memory tokens) = shapeXpInvExp.viewInventory(alice);
        assertEq(contracts[0], address(0));
        assertEq(tokens[0], 0);
    }

    function test_RevertRemoveNFTNoShapeXp() public {
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
    }

    function test_RevertRemoveNFTNotOwner() public {
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
    }

    function test_RevertRemoveNFTNotInInventory() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NFTNotInInventory.selector);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
    }

    function test_RemoveMultipleNFTs() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId1 = mockERC721.mint(alice);
        uint256 tokenId2 = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId2);

        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId2);
        vm.stopPrank();

        (address[3] memory contracts, uint256[3] memory tokens) = shapeXpInvExp.viewInventory(alice);
        assertEq(contracts[0], address(0));
        assertEq(contracts[1], address(0));
        assertEq(tokens[0], 0);
        assertEq(tokens[1], 0);
    }

    function test_RemoveNFTResetsExperience() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);

        // Check experience was added
        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), TRANSFER_EXPERIENCE_AMOUNT);

        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        vm.stopPrank();

        // Verify experience was reset
        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), 0);
    }

    function test_RemoveNFTUpdatesInventory() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        // Check NFT was added
        (address[3] memory contractsBefore, uint256[3] memory tokensBefore) = shapeXpInvExp.viewInventory(alice);
        assertEq(contractsBefore[0], address(mockERC721));
        assertEq(tokensBefore[0], tokenId);

        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        vm.stopPrank();

        // Verify NFT was removed
        (address[3] memory contractsAfter, uint256[3] memory tokensAfter) = shapeXpInvExp.viewInventory(alice);
        assertEq(contractsAfter[0], address(0));
        assertEq(tokensAfter[0], 0);
    }
}
