pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpGlobExpTest is Test {
    // ============ Storage ============
    MockERC721 public mockERC721;
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    // Events for experience tracking
    event GlobalExperienceAdded(address indexed user, uint256 amount, uint256 newTotal);
    event GlobalExperienceDeducted(address indexed user, uint256 amount, uint256 remaining);
    event ExperienceAdded(
        address indexed user,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 newTotal
    );

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));

        // Setup base state for users
        vm.startPrank(user1);
        shapeXpNFT.mint();
        vm.stopPrank();

        vm.startPrank(user2);
        shapeXpNFT.mint();
        vm.stopPrank();
    }

    // ============ Global Experience Tests ============
    function test_AddGlobalExperience() public {
        vm.startPrank(user1);

        uint256 initialAmount = 100;
        vm.expectEmit(true, false, false, true);
        emit GlobalExperienceAdded(user1, initialAmount, initialAmount);
        shapeXpInvExp.addGlobalExperience(initialAmount);
        assertEq(shapeXpInvExp.getGlobalExperience(user1), initialAmount);

        uint256 additionalAmount = 50;
        shapeXpInvExp.addGlobalExperience(additionalAmount);
        assertEq(shapeXpInvExp.getGlobalExperience(user1), initialAmount + additionalAmount);
        vm.stopPrank();
    }

    function test_RevertWhen_AddingGlobalExpWithoutNFT() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addGlobalExperience(100);
    }

    function test_RevertWhen_AddingZeroGlobalExp() public {
        vm.prank(user1);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InvalidAmount.selector);
        shapeXpInvExp.addGlobalExperience(0);
    }

    function test_GlobalExpPerUserIsolation() public {
        uint256 user1Amount = 100;
        uint256 user2Amount = 200;

        vm.prank(user1);
        shapeXpInvExp.addGlobalExperience(user1Amount);

        vm.prank(user2);
        shapeXpInvExp.addGlobalExperience(user2Amount);

        assertEq(shapeXpInvExp.getGlobalExperience(user1), user1Amount);
        assertEq(shapeXpInvExp.getGlobalExperience(user2), user2Amount);
    }

    // ============ Experience Allocation Tests ============
    function test_AllocateExperienceToNFT() public {
        uint256 globalAmount = 100;
        uint256 allocateAmount = 50;

        vm.startPrank(user1);

        // Setup initial state
        shapeXpInvExp.addGlobalExperience(globalAmount);
        uint256 tokenId = mockERC721.mint(user1);
        mockERC721.approve(address(shapeXpInvExp), tokenId);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        // Test allocation
        vm.expectEmit(true, true, true, true);
        emit ExperienceAdded(user1, address(mockERC721), tokenId, allocateAmount, allocateAmount);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, allocateAmount);

        // Verify final state
        assertEq(shapeXpInvExp.getGlobalExperience(user1), globalAmount - allocateAmount);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenId), allocateAmount);
        vm.stopPrank();
    }

    function test_RevertWhen_AllocatingMoreThanGlobalExp() public {
        uint256 globalAmount = 100;

        vm.startPrank(user1);
        shapeXpInvExp.addGlobalExperience(globalAmount);
        uint256 tokenId = mockERC721.mint(user1);
        mockERC721.approve(address(shapeXpInvExp), tokenId);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__InsufficientGlobalExperience.selector);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, globalAmount + 1);
        vm.stopPrank();
    }

    // ============ Complex Scenarios ============
    function test_MultiNFTExperienceAllocation() public {
        vm.startPrank(user1);

        // Setup
        uint256 globalAmount = 300;
        shapeXpInvExp.addGlobalExperience(globalAmount);

        uint256 tokenId1 = mockERC721.mint(user1);
        uint256 tokenId2 = mockERC721.mint(user1);
        mockERC721.approve(address(shapeXpInvExp), tokenId1);
        mockERC721.approve(address(shapeXpInvExp), tokenId2);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId1);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId2);

        // Test allocations
        uint256 allocation1 = 100;
        uint256 allocation2 = 150;
        shapeXpInvExp.addExperience(address(mockERC721), tokenId1, allocation1);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId2, allocation2);

        // Verify state
        assertEq(shapeXpInvExp.getGlobalExperience(user1), globalAmount - allocation1 - allocation2);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenId1), allocation1);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenId2), allocation2);
        vm.stopPrank();
    }

    function test_ExperienceWhenRemovingNFT() public {
        vm.startPrank(user1);

        // Setup
        uint256 globalAmount = 100;
        uint256 allocation = 50;
        uint256 tokenId = mockERC721.mint(user1);

        shapeXpInvExp.addGlobalExperience(globalAmount);
        mockERC721.approve(address(shapeXpInvExp), tokenId);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);
        shapeXpInvExp.addExperience(address(mockERC721), tokenId, allocation);

        // Test NFT removal
        shapeXpInvExp.removeNFTFromInventory(address(mockERC721), tokenId);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenId), 0);
        assertEq(shapeXpInvExp.getGlobalExperience(user1), globalAmount - allocation);
        vm.stopPrank();
    }

    // ============ Fuzz Tests ============
    function testFuzz_AddGlobalExperience(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint256).max / 2);

        vm.prank(user1);
        shapeXpInvExp.addGlobalExperience(amount);
        assertEq(shapeXpInvExp.getGlobalExperience(user1), amount);
    }

    function testFuzz_AllocateExperience(uint256 globalAmount, uint256 allocateAmount) public {
        vm.assume(globalAmount > 0 && globalAmount < type(uint256).max / 2);
        vm.assume(allocateAmount > 0 && allocateAmount <= globalAmount);

        vm.startPrank(user1);

        shapeXpInvExp.addGlobalExperience(globalAmount);
        uint256 tokenId = mockERC721.mint(user1);
        mockERC721.approve(address(shapeXpInvExp), tokenId);
        shapeXpInvExp.addNFTToInventory(address(mockERC721), tokenId);

        shapeXpInvExp.addExperience(address(mockERC721), tokenId, allocateAmount);

        assertEq(shapeXpInvExp.getGlobalExperience(user1), globalAmount - allocateAmount);
        assertEq(shapeXpInvExp.getNFTExperience(user1, address(mockERC721), tokenId), allocateAmount);
        vm.stopPrank();
    }
}
