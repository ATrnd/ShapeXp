// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShapeXpNFT} from "../../src/ShapeXpNFT.sol";
import {ShapeXpInv} from "../../src/ShapeXpInv.sol";
import {MockInvalidContract} from "../mock/MockInvalidContract.sol";
import {MockERC721} from "../mock/MockERC721.sol";

contract ShapeXpInvTest is Test {
    MockERC721 public mockERC721;
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInv public shapeXpInv;

    address public alice = makeAddr("alice");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        mockERC721 = new MockERC721("MockNFT", "MNFT");
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInv = new ShapeXpInv(address(shapeXpNFT));
    }

    function test_InvalidERC721Contract() public {
        vm.expectRevert(ShapeXpInv.ShapeXpInv__InvalidERC721Contract.selector);
        new ShapeXpInv(address(0));
    }

    function test_IsERC721_InvalidContract() public {
        address invalidERC721 = address(new MockInvalidContract());
        vm.expectRevert(ShapeXpInv.ShapeXpInv__InvalidERC721Contract.selector);
        new ShapeXpInv(invalidERC721);
    }

    function test_IsERC721_ValidContract() public {
        ShapeXpInv shapeXpInvCtr = new ShapeXpInv(address(shapeXpNFT));
        assertEq(shapeXpInvCtr.getTokenContract(), address(shapeXpNFT));
    }

    function test_GetTokenContract() public view {
        assertEq(shapeXpInv.getTokenContract(), address(shapeXpNFT));
    }

    function test_RevertNonShapeXpNFTOwner_NotTokenOwner() public {
        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotShapeXpNFTOwner.selector);
        shapeXpInv.revertNonShapeXpNFTOwner();
    }

    function test_RevertNonShapeXpNFTOwner_TokenOwner() public {
        vm.prank(user1);
        shapeXpNFT.mint();
        vm.prank(user1);
        shapeXpInv.revertNonShapeXpNFTOwner();
    }

    function test_RevertIfNotNFTOwner_NotOwner() public {
        // Setup: Mint an NFT to user1
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        // Attempt to verify ownership as alice (non-owner)
        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotNFTOwner.selector);
        shapeXpInv.revertIfNotNFTOwner(address(mockERC721), tokenId);
    }

    function test_RevertIfNotNFTOwner_Owner() public {
        // Setup: Mint an NFT to alice
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        // Verify ownership as alice (owner)
        vm.prank(alice);
        shapeXpInv.revertIfNotNFTOwner(address(mockERC721), tokenId);
        // No revert expected - test passes if function doesn't revert
    }

    function test_MultipleUsers() public {
        vm.prank(user1);
        shapeXpNFT.mint();

        vm.prank(user2);
        shapeXpNFT.mint();

        vm.prank(user1);
        shapeXpInv.revertNonShapeXpNFTOwner();

        vm.prank(user2);
        shapeXpInv.revertNonShapeXpNFTOwner();

        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotShapeXpNFTOwner.selector);
        shapeXpInv.revertNonShapeXpNFTOwner();
    }

    function test_BlockInvIfHasNoShapeXpToken() public {
        vm.prank(alice);
        uint256 newTokenId = mockERC721.mint(alice);
        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotShapeXpNFTOwner.selector);
        shapeXpInv.addNFTToInventory(address(mockERC721), newTokenId, address(0));
    }

    function test_BlockInvIfHasInputsNotOwnedNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        uint256 newTokenIdUser = mockERC721.mint(user1);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotNFTOwner.selector);
        shapeXpInv.addNFTToInventory(address(mockERC721), newTokenIdUser, address(0));
    }

    function test_AddingToInv() public {
        vm.prank(alice);
        uint256 newTokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), newTokenId, address(0));

        (address[3] memory nftContracts, uint256[3] memory tokenIds) = shapeXpInv.viewInventory(alice);
        assertEq(nftContracts[0], address(mockERC721), "First NFT contract should match.");
        assertEq(tokenIds[0], newTokenId, "First token ID should match.");
    }

    function test_RevertOnDuplicateNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId, address(0));

        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NFTAlreadyInInventory.selector);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId, address(0));
    }

    function test_RevertOnInvFull() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId1 = mockERC721.mint(alice);
        uint256 tokenId2 = mockERC721.mint(alice);
        uint256 tokenId3 = mockERC721.mint(alice);
        uint256 tokenId4 = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId1, address(0));

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId2, address(0));

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId3, address(0));

        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__InventoryFull.selector);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId4, address(0));
    }

    function test_HasNFT_ReturnsTrueForExistingNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId, address(0));

        bool hasNft = shapeXpInv.hasNFT(alice, address(mockERC721), tokenId);
        assertTrue(hasNft, "hasNFT should return true for existing NFT in inventory");
    }

    function test_HasNFT_ReturnsFalseForNonexistentNFT() public {
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        bool hasNft = shapeXpInv.hasNFT(alice, address(mockERC721), tokenId);
        assertFalse(hasNft, "hasNFT should return false for NFT not in inventory");
    }

    function test_HasNFT_ReturnsFalseForWrongContract() public {
        // Setup: Give alice a ShapeXp token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Mint an NFT and add it to inventory
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId, address(0));

        // Check with wrong contract address
        bool hasNft = shapeXpInv.hasNFT(alice, address(shapeXpNFT), tokenId);
        assertFalse(hasNft, "hasNFT should return false for wrong contract address");
    }

    function test_HasNFT_MultipleNFTs() public {
        // Setup: Give alice a ShapeXp token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Mint multiple NFTs and add them to inventory
        vm.prank(alice);
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            tokenIds[i] = mockERC721.mint(alice);
            vm.prank(alice);
            shapeXpInv.addNFTToInventory(address(mockERC721), tokenIds[i], address(0));
        }

        // Check each NFT is found
        for (uint256 i = 0; i < 3; i++) {
            bool hasNft = shapeXpInv.hasNFT(alice, address(mockERC721), tokenIds[i]);
            assertTrue(hasNft, string.concat("hasNFT should return true for token ID ", vm.toString(tokenIds[i])));
        }
    }

    function test_RemoveNFT_RevertNoShapeXpToken() public {
        // Try to remove NFT without owning ShapeXp token
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotShapeXpNFTOwner.selector);
        shapeXpInv.removeNFTFromInventory(address(mockERC721), tokenId, address(0));
    }

    function test_RemoveNFT_RevertNotNFTOwner() public {
        // Setup: Give alice a ShapeXp token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Mint NFT to user1
        vm.prank(user1);
        uint256 tokenId = mockERC721.mint(user1);

        // Try to remove NFT that alice doesn't own
        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NotNFTOwner.selector);
        shapeXpInv.removeNFTFromInventory(address(mockERC721), tokenId, address(0));
    }

    function test_RemoveNFT_RevertNFTNotInInventory() public {
        // Setup: Give alice a ShapeXp token and an NFT
        vm.prank(alice);
        shapeXpNFT.mint();

        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        // Try to remove NFT that's not in inventory
        vm.prank(alice);
        vm.expectRevert(ShapeXpInv.ShapeXpInv__NFTNotInInventory.selector);
        shapeXpInv.removeNFTFromInventory(address(mockERC721), tokenId, address(0));
    }

    function test_RemoveNFT_SuccessfulRemoval() public {
        // Setup: Give alice a ShapeXp token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Mint and add NFT to inventory
        vm.prank(alice);
        uint256 tokenId = mockERC721.mint(alice);

        vm.prank(alice);
        shapeXpInv.addNFTToInventory(address(mockERC721), tokenId, address(0));

        // Remove NFT
        vm.prank(alice);
        shapeXpInv.removeNFTFromInventory(address(mockERC721), tokenId, address(0));

        // Verify removal
        (address[3] memory contracts, uint256[3] memory tokenIds) = shapeXpInv.viewInventory(alice);
        assertEq(contracts[0], address(0), "NFT contract should be zero address after removal");
        assertEq(tokenIds[0], 0, "Token ID should be zero after removal");
    }

    function test_RemoveNFT_FromDifferentPositions() public {
        // Setup: Give alice a ShapeXp token
        vm.prank(alice);
        shapeXpNFT.mint();

        // Mint and add multiple NFTs
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(alice);
            tokenIds[i] = mockERC721.mint(alice);

            vm.prank(alice);
            shapeXpInv.addNFTToInventory(address(mockERC721), tokenIds[i], address(0));
        }

        // Remove middle NFT (index 1)
        vm.prank(alice);
        shapeXpInv.removeNFTFromInventory(address(mockERC721), tokenIds[1], address(0));

        // Verify state
        (address[3] memory contracts, uint256[3] memory ids) = shapeXpInv.viewInventory(alice);

        // First and last NFTs should remain
        assertEq(contracts[0], address(mockERC721), "First NFT should remain");
        assertEq(ids[0], tokenIds[0], "First token ID should remain");

        // Middle slot should be empty
        assertEq(contracts[1], address(0), "Middle slot should be empty");
        assertEq(ids[1], 0, "Middle token ID should be zero");

        // Last NFT should remain
        assertEq(contracts[2], address(mockERC721), "Last NFT should remain");
        assertEq(ids[2], tokenIds[2], "Last token ID should remain");
    }
}
