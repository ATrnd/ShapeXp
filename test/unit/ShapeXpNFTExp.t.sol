// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpExpTest is Test {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;
    MockERC721 public mockERC721;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");

    // Experience amount based on contract initialization
    uint256 private constant TRANSFER_EXPERIENCE_AMOUNT = 500;
    uint256 private constant LOW_AMOUNT = 1000;
    uint256 private constant MID_AMOUNT = 2500;
    uint256 private constant HIGH_AMOUNT = 5000;

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
    }

    /// @notice tests for : addNFTExperience(address nftContract, uint256 tokenId) external {...}
    function test_AddNFTExperience() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);
        vm.stopPrank();

        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), TRANSFER_EXPERIENCE_AMOUNT);
    }

    function test_RevertAddNFTExperienceNoShapeXp() public {
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);
    }

    function test_RevertAddNFTExperienceNotOwner() public {
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);
    }

    function test_RevertAddNFTExperienceNotInInventory() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotInInventory.selector);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);
    }

    function test_RevertAddNFTExperienceInsufficientGlobalExperience() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InsufficientGlobalExperience.selector);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId);
        vm.stopPrank();
    }

    function test_AddMultipleNFTExperience() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId1 = mockERC721.mint(alice);
        uint256 tokenId2 = mockERC721.mint(alice);

        vm.startPrank(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId2);

        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.HIGH);

        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTExperience(address(mockERC721), tokenId2);
        vm.stopPrank();

        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId1), TRANSFER_EXPERIENCE_AMOUNT);
        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId2), TRANSFER_EXPERIENCE_AMOUNT);
    }
}
