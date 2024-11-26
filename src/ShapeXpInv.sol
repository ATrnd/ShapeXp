pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ShapeXpInv {
    IERC721 private immutable s_shapeNFTCtr;

    error ShapeXpInv__InvalidERC721Contract();
    error ShapeXpInv__NotShapeXpNFTOwner();
    error ShapeXpInv__AccessDenied();
    error ShapeXpInv__ShapeXpNFTNotAllowed();
    error ShapeXpInv__InventoryFull();
    error ShapeXpInv__NotNFTOwner();
    error ShapeXpInv__NFTAlreadyInInventory();
    error ShapeXpInv__NFTNotInInventory();

    struct UserInventory {
        address[3] nftContracts;
        uint256[3] tokenIds;
    }

    mapping(address => UserInventory) private userInventories;
    address private s_authorizedCaller;
    address private immutable i_owner;
    bool private s_callerSet = false;

    modifier onlyAuthorizedCallers() {
        if (msg.sender != s_authorizedCaller) {
            revert("Access Denied: Unauthorized caller");
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert("Access Denied: Only owner can set authorized caller");
        }
        _;
    }

    function setAuthorizedCaller(address authorizedCaller) external {
        if (s_callerSet) {
            revert("Caller already set");
        }
        s_authorizedCaller = authorizedCaller;
        s_callerSet = true;
    }

    constructor(address shapeNFTCtr) {
        if (shapeNFTCtr == address(0) || !_isERC721(shapeNFTCtr)) {
            revert ShapeXpInv__InvalidERC721Contract();
        }
        s_shapeNFTCtr = IERC721(shapeNFTCtr);
        i_owner = msg.sender;
    }

    function _isERC721(address contractAddress) private view returns (bool) {
        try IERC165(contractAddress).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
            return isSupported;
        } catch {
            return false;
        }
    }

    function revertNonShapeXpNFTOwnerWithAddr(address user) public view onlyAuthorizedCallers {
        if (s_shapeNFTCtr.balanceOf(user) == 0) {
            revert ShapeXpInv__NotShapeXpNFTOwner();
        }
    }

    function revertNonShapeXpNFTOwner() public view {
        if (s_shapeNFTCtr.balanceOf(msg.sender) == 0) {
            revert ShapeXpInv__NotShapeXpNFTOwner();
        }
    }

    function getTokenContract() external view returns (address) {
        return address(s_shapeNFTCtr);
    }

    function revertIfNotNFTOwner(address NFTCtr, uint256 tokenId) public view {
        IERC721 inputNFT = IERC721(NFTCtr);
        if (inputNFT.ownerOf(tokenId) != msg.sender) revert ShapeXpInv__NotNFTOwner();
    }

    function addNFTToInventory(address NFTCtr, uint256 tokenId, address callerAddr) external {
        if(s_callerSet) {
            revertNonShapeXpNFTOwnerWithAddr(callerAddr);
        } else {
            revertNonShapeXpNFTOwner();
        }
        revertIfNotNFTOwner(NFTCtr, tokenId);

        UserInventory storage inventory = userInventories[msg.sender];

        // Check for duplicates first
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == NFTCtr && inventory.tokenIds[i] == tokenId) {
                revert ShapeXpInv__NFTAlreadyInInventory();
            }
        }

        // Look for empty slot
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == address(0)) {
                inventory.nftContracts[i] = NFTCtr;
                inventory.tokenIds[i] = tokenId;
                return;
            }
        }

        // If we get here, inventory is full
        revert ShapeXpInv__InventoryFull();
    }

    function removeNFTFromInventory(address NFTCtr, uint256 tokenId, address callerAddr) external {
        if(s_callerSet) {
            revertNonShapeXpNFTOwnerWithAddr(callerAddr);
        } else {
            revertNonShapeXpNFTOwner();
        }
        revertIfNotNFTOwner(NFTCtr, tokenId);

        UserInventory storage inventory = userInventories[msg.sender];
        bool found = false;
        uint256 foundIndex;

        // Find the NFT in the inventory
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == NFTCtr && inventory.tokenIds[i] == tokenId) {
                found = true;
                foundIndex = i;
                break;
            }
        }

        if (!found) {
            revert ShapeXpInv__NFTNotInInventory();
        }

        // Remove the NFT by setting its slot to zero address and zero token ID
        inventory.nftContracts[foundIndex] = address(0);
        inventory.tokenIds[foundIndex] = 0;
    }

    function viewInventory(address user) external view returns (address[3] memory, uint256[3] memory) {
        return (userInventories[user].nftContracts, userInventories[user].tokenIds);
    }

    function hasNFT(address user, address nftContract, uint256 tokenId) external view returns (bool) {
        UserInventory storage inventory = userInventories[user];
        for (uint256 i = 0; i < 3; i++) {
            if (inventory.nftContracts[i] == nftContract && inventory.tokenIds[i] == tokenId) {
                return true;
            }
        }
        return false;
    }
}
