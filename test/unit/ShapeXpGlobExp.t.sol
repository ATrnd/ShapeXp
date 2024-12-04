// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../../src/ShapeXpInvExp.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpGlobalExpTest is Test {
    ShapeXpInvExp public shapeXpInvExp;
    ShapeXpNFT public shapeXpNFT;

    address public alice = makeAddr("alice");

    // Experience amounts based on contract initialization
    uint256 private constant LOW_AMOUNT = 1000;
    uint256 private constant MID_AMOUNT = 2500;
    uint256 private constant HIGH_AMOUNT = 5000;
    uint256 private constant MAX_EXPERIENCE = 100000;

    function setUp() public {
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
    }

    function test_AddGlobalExperienceLowAmount() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);

        assertEq(shapeXpInvExp.getGlobalExperience(alice), LOW_AMOUNT);
    }

    function test_AddGlobalExperienceRevertNoShapeXpNFT() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpInvExp.ShapeXpInvExp__NotShapeXpNFTOwner.selector);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);
    }

    function test_AddGlobalExperienceRevertOnCooldown() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ShapeXpInvExp.ShapeXpInvExp__OnCooldown.selector, 1800));
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);
    }

    function test_AddGlobalExperienceAfterCooldown() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);

        vm.warp(block.timestamp + 1800);

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);

        assertEq(shapeXpInvExp.getGlobalExperience(alice), LOW_AMOUNT * 2);
    }

    function test_AddGlobalExperienceCapped() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 nearCap = MAX_EXPERIENCE - HIGH_AMOUNT + 1;
        vm.store(address(shapeXpInvExp), keccak256(abi.encode(alice, uint256(4))), bytes32(uint256(nearCap)));

        vm.expectEmit(true, true, false, true);
        emit ShapeXpInvExp.ExperienceCapped(
            alice, ShapeXpInvExp.ExperienceAmount.HIGH, HIGH_AMOUNT, MAX_EXPERIENCE - nearCap
        );

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.HIGH);

        assertEq(shapeXpInvExp.getGlobalExperience(alice), MAX_EXPERIENCE);
    }

    function test_AddGlobalExperienceAllTypes() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256[3] memory amounts = [LOW_AMOUNT, MID_AMOUNT, HIGH_AMOUNT];
        ShapeXpInvExp.ExperienceAmount[3] memory types = [
            ShapeXpInvExp.ExperienceAmount.LOW,
            ShapeXpInvExp.ExperienceAmount.MID,
            ShapeXpInvExp.ExperienceAmount.HIGH
        ];

        uint256 totalExp = 0;
        for (uint256 i = 0; i < types.length; i++) {
            vm.warp(block.timestamp + 1800);
            vm.prank(alice);
            shapeXpInvExp.addGlobalExperience(types[i]);
            totalExp += amounts[i];
            assertEq(shapeXpInvExp.getGlobalExperience(alice), totalExp);
        }
    }

    function test_AddGlobalExperienceEmitsEvent() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.expectEmit(true, true, false, true);
        emit ShapeXpInvExp.GlobalExperienceAdded(alice, ShapeXpInvExp.ExperienceAmount.LOW, LOW_AMOUNT, LOW_AMOUNT);

        vm.prank(alice);
        shapeXpInvExp.addGlobalExperience(ShapeXpInvExp.ExperienceAmount.LOW);
    }
}
