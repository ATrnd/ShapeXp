# ShapeXp - NFT Experience System

![ShapeXp_0.1](https://github.com/ATrnd/ShapeXp/blob/main/img/ShapeXp_0.1.jpg)

ShapeXp is a dual experience system for NFTs with inventory management capabilities. It allows users to accumulate global experience points and transfer them to specific NFTs in their inventory.

> ⚠️ **NOTICE**: This system was developed for the <a href="https://shape.network/shapecraft">ShapeCraft</a> Hackathon and is currently under development. Features and interfaces may change as the system evolves.

## Deployed Contracts (Sepolia Testnet)

- **ShapeXpNFT**: `0x2a12F0d3aa55656642BeD81337957e610E450607`
- **ShapeXpInvExp**: `0x821098072DFB484e54218500F98C37f824bbb325`

## Core Features

- **Soulbound Access NFT**: Users need to mint a ShapeXpNFT to access the experience system
- **Global Experience Pool**: Users can accumulate experience points in their global pool
- **NFT Inventory**: Users can manage up to 3 NFTs in their inventory
- **Experience Transfer**: Transfer experience points from global pool to specific NFTs
- **Experience Caps & Cooldowns**: Built-in mechanics to ensure balanced progression

## Contracts

### ShapeXpNFT.sol
A non-transferable (soulbound) NFT that grants access to the experience system.

Key functions:
```solidity
// Mint your access NFT (one per address)
function mint() external;

// Check if an address has minted
function hasMintedToken(address user) external view returns (bool);
```

### ShapeXpInvExp.sol
The main experience system contract that handles all experience and inventory logic.

Key functions:
```solidity
// Add experience to global pool
function addGlobalExperience(ExperienceAmount expType) external;

// Add NFT to inventory (max 3 slots)
function addNFTToInventory(address nftContract, uint256 tokenId) external;

// Transfer experience to NFT
function addNFTExperience(address nftContract, uint256 tokenId) external;

// View functions
function getGlobalExperience(address user) external view returns (uint256);
function getNFTExperience(address user, address nftContract, uint256 tokenId) external view returns (uint256);
```

## Integration Flow

1. Deploy both contracts (ShapeXpNFT first)
2. Users must mint a ShapeXpNFT to access the system
3. Users can then:
   - Gain global experience (with 30-minute cooldown)
   - Add NFTs to their inventory
   - Transfer experience to their NFTs

## Experience System Details

- Three experience tiers: LOW (1000), MID (2500), HIGH (5000)
- Maximum experience cap: 100,000 points
- Cooldown period: 30 minutes between experience gains
- Transfer amount: 500 points per transfer to NFT

## Important Notes

- All functions require ShapeXpNFT ownership
- NFTs must be in inventory to receive experience
- Users must own the NFTs they add to inventory
- The ShapeXpNFT itself cannot be added to inventory

## Security

- Soulbound NFT (non-transferable)
- Built-in cooldowns and caps
- Ownership validations for all operations
- Clear error messages for failed operations

## Example Usage

```solidity
// 1. Deploy contracts
ShapeXpNFT nft = new ShapeXpNFT();
ShapeXpInvExp exp = new ShapeXpInvExp(address(nft));

// 2. Users mint access NFT
nft.mint();

// 3. Gain experience
exp.addGlobalExperience(ExperienceAmount.LOW);

// 4. Add NFT to inventory
exp.addNFTToInventory(nftAddress, tokenId);

// 5. Transfer experience to NFT
exp.addNFTExperience(nftAddress, tokenId);

// 6. Check experience
uint256 nftExp = exp.getNFTExperience(user, nftAddress, tokenId);
```

## License

Distributed under the MIT License.

## Contact

- Atrnd - atrnd.work@gmail.com
- Discord - hyper_eth
- Telegram - https://t.me/at_rnd
