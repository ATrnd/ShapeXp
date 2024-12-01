// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpExpTest is Test {
    // ============ Storage ============
    MockERC721 public mockERC721;
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    // ============ Events ============
    event GlobalExperienceAdded(address indexed user, uint256 amount, uint256 newTotal);
    event GlobalExperienceDeducted(address indexed user, uint256 amount, uint256 remaining);
    event ExperienceAdded(
        address indexed user,
        address indexed shapeXpNftCtr,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 newTotal
    );

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
    }

    // ============ Global Experience Addition Tests ============
    function test_RevertWhen_AddingGlobalExpWithoutShapeXpNFT() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addGlobalExperience(100);
    }

    function test_RevertWhen_AddingZeroGlobalExp() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidAmount.selector);
        shapeXpInvExp.addGlobalExperience(0);
        vm.stopPrank();
    }

    function test_SuccessfulGlobalExpAddition() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();

        uint256 initialAmount = 100;
        vm.expectEmit(true, false, false, true);
        emit GlobalExperienceAdded(alice, initialAmount, initialAmount);
        shapeXpInvExp.addGlobalExperience(initialAmount);

        assertEq(shapeXpInvExp.getGlobalExperience(alice), initialAmount);
        vm.stopPrank();
    }

    function test_MultipleGlobalExpAdditions() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();

        shapeXpInvExp.addGlobalExperience(100);
        shapeXpInvExp.addGlobalExperience(150);

        assertEq(shapeXpInvExp.getGlobalExperience(alice), 250);
        vm.stopPrank();
    }

    // ============ NFT Experience Allocation Tests ============
    function test_RevertWhen_AllocatingExpWithoutShapeXpNFT() public {
        uint256 tokenId = 1;
        vm.startPrank(alice);
        mockERC721.mint(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        vm.stopPrank();
    }

    function test_RevertWhen_AllocatingToUnownedNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 tokenId = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotNFTOwner.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
    }

    function test_RevertWhen_AllocatingToNFTNotInInventory() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotInInventory.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        vm.stopPrank();
    }

    function test_RevertWhen_AllocatingInsufficientGlobalExp() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        shapeXpInvExp.addGlobalExperience(50);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InsufficientGlobalExperience.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        vm.stopPrank();
    }

    function test_SuccessfulExpAllocation() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        uint256 globalAmount = 100;
        uint256 allocateAmount = 50;

        shapeXpInvExp.addGlobalExperience(globalAmount);

        vm.expectEmit(true, true, true, true);
        emit ExperienceAdded(alice, address(mockERC721), tokenId, allocateAmount, allocateAmount);
        vm.expectEmit(true, false, false, true);
        emit GlobalExperienceDeducted(alice, allocateAmount, globalAmount - allocateAmount);

        shapeXpInvExp.addExperience(address(mockERC721), tokenId, allocateAmount);

        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), allocateAmount);
        assertEq(shapeXpInvExp.getGlobalExperience(alice), globalAmount - allocateAmount);
        vm.stopPrank();
    }

    function test_MultipleExpAllocations() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        shapeXpInvExp.addGlobalExperience(300);

        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 100);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 150);

        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), 250);
        assertEq(shapeXpInvExp.getGlobalExperience(alice), 50);
        vm.stopPrank();
    }

    // ============ Experience State Tests ============
    function test_ExpResetAfterNFTRemoval() public {
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 tokenId = mockERC721.mint(alice);

        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.addGlobalExperience(100);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, 50);

        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), tokenId), 0);
        assertEq(shapeXpInvExp.getGlobalExperience(alice), 50);
        vm.stopPrank();
    }

    function test_ExpIsolationBetweenUsers() public {
        // Setup Alice
        vm.startPrank(alice);
        shapeXpNFT.mint();
        uint256 aliceTokenId = mockERC721.mint(alice);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), aliceTokenId);
        shapeXpInvExp.addGlobalExperience(100);
        shapeXpInvExp.addExperience(address(mockERC721), aliceTokenId, 50);
        vm.stopPrank();

        // Setup User1
        vm.startPrank(user1);
        shapeXpNFT.mint();
        uint256 user1TokenId = mockERC721.mint(user1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), user1TokenId);
        shapeXpInvExp.addGlobalExperience(200);
        shapeXpInvExp.addExperience(address(mockERC721), user1TokenId, 100);
        vm.stopPrank();

        assertEq(shapeXpInvExp.getNFTExperience(alice, address(mockERC721), aliceTokenId), 50);
        assertEq(shapeXpInvExp.getGlobalExperience(alice), 50);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), user1TokenId), 100);
        assertEq(shapeXpInvExp.getGlobalExperience(user1), 100);
    }
}
