// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockInvalidContract} from "../mock/MockInvalidContract.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpExpTest is Test {
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

    // ============ Experience Addition Revert Tests ============
    function test_RevertWhen_AddingExperienceWithoutShapeXpToken() public {
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
    }

    function test_RevertWhen_AddingExperienceToUnownedNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
    }

    function test_RevertWhen_AddingExperienceToNFTNotInInventory() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotInInventory.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        vm.stopPrank();
    }

    function test_RevertWhen_AddingZeroExperience() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidAmount.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 0);
        vm.stopPrank();
    }

    // ============ Experience Addition Success Tests ============
    function test_SuccessfulExperienceAddition() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);

        uint256 experience = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId);
        assertEq(experience, 100, "Experience should be 100");
        vm.stopPrank();
    }

    function test_SuccessfulMultipleExperienceAdditions() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 150);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 250);

        uint256 experience = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId);
        assertEq(experience, 500, "Total experience should be 500");
        vm.stopPrank();
    }

    // ============ Experience Retrieval Tests ============
    function test_GetExperienceForNonexistentNFT() public view {
        uint256 experience = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), 999);
        assertEq(experience, 0, "Experience should be 0 for non-existent NFT");
    }

    function test_GetExperienceForMultipleUsers() public {
        // Setup and add experience for Alice
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenIdAlice = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIdAlice);
        shapeXpInvExp.addExperience(address(mockERC721), tokenIdAlice, 100);
        vm.stopPrank();

        // Setup and add experience for User1
        vm.startPrank(user1);
        shapeXpNFT.mint();
        uint256 tokenIdUser1 = mockERC721.mint(user1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenIdUser1);
        shapeXpInvExp.addExperience(address(mockERC721), tokenIdUser1, 200);
        vm.stopPrank();

        // Verify experiences
        uint256 aliceExp = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenIdAlice);
        uint256 user1Exp = shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenIdUser1);

        assertEq(aliceExp, 100, "Alice's NFT experience should be 100");
        assertEq(user1Exp, 200, "User1's NFT experience should be 200");
    }

    // ============ Experience State Tests ============
    function test_ExperienceStateAfterRemoval() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);

        uint256 experience = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId);
        assertEq(experience, 0, "Experience should be reset to 0 after removal");

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        experience = shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId);
        assertEq(experience, 0, "Experience should start at 0 for re-added NFT");
        vm.stopPrank();
    }

    // ============ Event Tests ============
    function test_ExperienceAddedEventEmission() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectEmit(true, true, true, true);
        emit ShapeXpInvExp.ExperienceAdded(
            alice,
            address(mockERC721),
            tokenId,
            100,
            100
        );
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        vm.stopPrank();
    }
}
