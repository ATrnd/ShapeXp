# ShapeXp

![ShapeXp_0.1](https://github.com/ATrnd/ShapeXp/blob/main/img/ShapeXp_0.1.jpg)

## Abstract

ShapeXp is a Cross-World NFT Experience System for ShapeCraft.
The goal of ShapeXp is to provide a utility tool for game developers which makes it easy to delegate some complexity of their world design,
by providing a standalone security, experience, and inventory management system.

## Features

### Core System
- **Soulbound ShapeXp NFT**
  - One-per-address access token
  - Non-transferable (soulbound) implementation
  - Required for system interaction
  - Secure access control mechanism

### Experience System
- **Dual Experience Tracking**
  - Global experience pool for users
  - NFT-specific experience tracking
  - Experience transfer mechanism between global and NFT pools
  - Maximum cap of 100,000 experience points

### Experience Gain Mechanics
- **Tiered Experience Gains**
  - LOW: 1,000 points
  - MID: 2,500 points
  - HIGH: 5,000 points
- **Anti-Spam Protection**
  - 30-minute cooldown between experience gains
  - Experience transfer rate of 500 points

### Inventory Management
- **NFT Inventory System**
  - Fixed 3-slot inventory per user
  - Support for any ERC721 NFT
  - NFT experience tracking
  - Add/remove NFT capabilities

### Security Features
- **Built-in Validations**
  - NFT ownership verification
  - Inventory slot availability checks
  - Experience balance validation
  - Cooldown period enforcement

### Developer Integration
- **Comprehensive API**
  - Global JavaScript API
  - Event tracking and notifications
  - Experience management functions
  - Inventory manipulation methods

## Installation Guide

### Clone the Repository
```bash
git clone https://github.com/ATrnd/ShapeXp.git
cd ShapeXp
```

### Backend Setup (Solidity)

#### Install Foundry
If you don't have Foundry installed, run:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install Foundry dependencies
```bash
# cd ShapeXp
foundry install
```

#### Run Foundry Tests
```bash
forge test
```

### Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
npm run dev
```

#### Environment Setup
Create a `.env` file in the `frontend` directory with the following variables:

```env
# For Shape Sepolia
VITE_ALCHEMY_API_KEY=your_api_key
VITE_SEPOLIA_RPC_URL=https://shape-sepolia.g.alchemy.com/v2/your_api_key
VITE_SEPOLIA_BASE_URL=https://shape-sepolia.g.alchemy.com/v2

# For Shape Mainnet (overwrite Sepolia variables)
# VITE_ALCHEMY_API_KEY=your_api_key
# VITE_SEPOLIA_RPC_URL=https://shape-mainnet.g.alchemy.com/v2/your_api_key
# VITE_SEPOLIA_BASE_URL=https://shape-mainnet.g.alchemy.com/v2/
```

## Requirements

### Frontend Dependencies
- Node.js with npm
- Vite 6.0.1
- TypeScript 5.6.2
- Ethers.js 6.13.4
- TailwindCSS 3.4.16
- PostCSS 8.4.49
- Autoprefixer 10.4.20

### Backend Dependencies
- Foundry 0.2.0

## External Libraries and Resources

### Related Repositories

#### ShapeXpSandbox
```
https://github.com/ATrnd/ShapeXpSandbox
```
Core implementation of ShapeXp UI functionalities and API. This repository contains the implementation of the `window.ShapeXpAPI` interface and core functionality.

#### ShapeXpFrontEnd
```
https://github.com/ATrnd/ShapeXpFrontEnd
```
Prototype frontend implementation demonstrating ShapeXp integration and usage. Used for initial prototyping and testing of the ShapeXp system.

## Deployed Addresses

### shape:mainnet
```
ShapeXpNFT    => 0x2a12F0d3aa55656642BeD81337957e610E450607
ShapeXpInvExp => 0x821098072DFB484e54218500F98C37f824bbb325
```

### shape:sepolia
```
ShapeXpNFT    => 0x2a12F0d3aa55656642BeD81337957e610E450607
ShapeXpInvExp => 0x821098072DFB484e54218500F98C37f824bbb325
```

## API Documentation

### Overview
ShapeXp provides a global JavaScript API (`window.ShapeXpAPI`) for integrating ShapeXp functionality into web applications. The API enables experience tracking, NFT management, and inventory operations.

### Getting Started

```javascript
// Check if user has ShapeXp NFT
const hasNFT = await window.ShapeXpAPI.hasShapeXp();
console.log('Has ShapeXp NFT:', hasNFT);
```

### Core Methods

#### Experience Management

##### `getShapeXp()`
Get current account's ShapeXp amount.
```javascript
const xp = await ShapeXpAPI.getShapeXp();
```

##### `addGlobalExperience(type)`
Add global experience points. Type can be "LOW", "MID", or "HIGH".
```javascript
const result = await ShapeXpAPI.addGlobalExperience("LOW");
if (result.success) {
    console.log('Transaction:', result.transactionHash);
}
```

#### NFT Operations

##### `mintShapeXp()`
Mint a new ShapeXp NFT.
```javascript
const result = await ShapeXpAPI.mintShapeXp();
if (result.success) {
    console.log('Minting successful:', result.tx);
}
```

##### `getNFTs(address?)`
Get all NFTs for current address or specified address.
```javascript
const {success, nfts} = await ShapeXpAPI.getNFTs();
if (success) {
    console.log('NFTs:', nfts);
}
```

#### Inventory Management

##### `getInventory(address?)`
Get inventory for current address or specified address.
```javascript
const {success, inventory} = await ShapeXpAPI.getInventory();
```

##### `addNFTToInventory(contractAddress, tokenId)`
Add NFT to ShapeXp inventory.
```javascript
const result = await ShapeXpAPI.addNFTToInventory(
    "0x123...",
    "1"
);
```

##### `removeNFTFromInventory(contractAddress, tokenId)`
Remove NFT from ShapeXp inventory.
```javascript
const result = await ShapeXpAPI.removeNFTFromInventory(
    "0x123...",
    "1"
);
```

##### `getNFTExperience(contractAddress, tokenId)`
Get experience points for a specific NFT.
```javascript
const {success, experience} = await ShapeXpAPI.getNFTExperience(
    "0x123...",
    "1"
);
```

##### `addNFTExperience(nftContract, tokenId)`
Add experience points to a specific NFT.
```javascript
const result = await ShapeXpAPI.addNFTExperience(
    "0x123...",
    "1"
);
```

#### Lookup Functions

##### `shapeXpLookup(address)`
Look up ShapeXp amount for any address.
```javascript
const result = await ShapeXpAPI.shapeXpLookup("0x123...");
if (result.success) {
    console.log('Amount:', result.amount);
    console.log('Raw:', result.raw);
}
```

##### `shapeXpLookupNFT(address)`
Check if an address owns ShapeXp NFT.
```javascript
const result = await ShapeXpAPI.shapeXpLookupNFT("0x123...");
if (result.success) {
    console.log('Has NFT:', result.hasNFT);
}
```

### Response Types
All methods return a standardized response object:
```typescript
{
    success: true;
    // Additional data specific to the method
} | {
    success: false;
    error: string;
}
```

## Testing Flow for Judges

Here's a step-by-step guide to test the complete functionality of ShapeXp.

1. Connect the ShapeXp Dapp
   - UI: Click the "Connect" button
   - API: No API call needed - wallet connection handled by UI

2. Mint a ShapeXp Token
   - UI: Click the "Mint ShapeXp" button
   - API:
   ```javascript
   // Mint a ShapeXp NFT
   await ShapeXpAPI.mintShapeXp()
   ```

3. Gain ShapeXp
   - UI: Use the "Gain Shapexp" buttons in the experience section, (note: adding experience has a 30 minute cooldown / address)
   - API:
   ```javascript
   // Add global experience points (LOW/MID/HIGH)
   await ShapeXpAPI.addGlobalExperience("HIGH")
   ```

4. Lookup your NFTs
```javascript
// Get all NFTs for current address
await ShapeXpAPI.getNFTs()
```

5. Get current account's inventory
```javascript
// Fetch inventory
await ShapeXpAPI.getInventory()
```

6. Add NFT to inventory
```javascript
// Add NFT using contract address and token ID
await ShapeXpAPI.addNFTToInventory(contract, tokenId)
```

7. Verify if NFT is added
```javascript
// Check updated inventory
await ShapeXpAPI.getInventory()
```

8. Add experience to NFT
```javascript
// Add experience to specific NFT
await ShapeXpAPI.addNFTExperience(contract, tokenId)
```

9. Verify if experience is added
```javascript
// Check NFT experience
await ShapeXpAPI.getNFTExperience(contract, tokenId)
```

10. Remove NFT from inventory
```javascript
// Remove NFT from ShapeXp inventory
await ShapeXpAPI.removeNFTFromInventory(contractAddress, tokenId)
```

11. Verify if NFT is removed
```javascript
// Check updated inventory
await ShapeXpAPI.getInventory()
```

## Special Thanks To:
- Dan Nolan, for providing awesome resources, tips and tricks, and support when I was struggling with ShapeXp
- Alex, for giving feedback and helping me brainstorm about how I could improve ShapeXp
- Han, for being gentle and kind and making ShapeCraft possible for all of us
- All the participants, taking part in this journey with me and shaping the foundations of a radical new world
