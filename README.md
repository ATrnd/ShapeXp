<a id="readme-top"></a>
<!-- PROJECT SHIELDS -->
[foundry-shield]: https://img.shields.io/badge/Foundry-FF4F00?style=for-the-badge&logo=foundry&logoColor=white
[foundry-url]: https://getfoundry.sh/

[solidity-shield]: https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white
[solidity-url]: https://soliditylang.org/

[license-shield]: https://img.shields.io/badge/License-MIT-green?style=for-the-badge
[license-url]: https://opensource.org/licenses/MIT

<!-- PROJECT LOGO -->
<br />
<div align="center">

  ![ShapeXp_0.1](https://github.com/ATrnd/ShapeXp/blob/main/img/ShapeXp_0.1.jpg)
  <h3 align="center">SHAPE XP</h3>
  <p align="center">
    An NFT leveling utility engine for <a href="https://shape.network/shapecraft">ShapeCraft</a>
  </p>

</div>

<!-- SHAPE XP, PREFACE -->
## SHAPE XP, PREFACE

ShapeCraft, the home of connected worlds, the landscape of the unknown, unexplored depths of opportunities, hope, and revolution.
Thanks to the Shapecraft team, now we can literally shape the future of planet Earth in ways we never could before.
It's here, the force which breaks our chains, sets us free from the centralized monetization autopilot mode, and guides us to the
(only) direction where we may all unite, collaborate, and work together on online worlds where the limit is our imagination only.

<!-- SHAPE XP - AN NFT LEVELING UTILITY ENGINE FOR SHAPECRAFT -->
## SHAPE XP - A CROSS-WORLD NFT EXPERIENCE SYSTEM INTRO

Shapecraft is driven by NFTs, and world builders integrate these NFTs into their creations for a variety of reasons.
All worlds are connected, and users can travel between them, carrying their NFTs and making use of them in each world they visit.
The Shape Xp project is an early-stage proposal for a standard methodology and mindset when it comes to 'connected world experience' design/development.

What it does is simple: while in centralized game development, Game Designers balance the world and all its rules, in decentralized and connected world
development, we need rulesets and globally accepted functionality across as many worlds as possible to assist developers & builders
focusing on their game experience design, while providing access to free, open, and secure functionalities that would be difficult to implement for each world separately, providing the foundational level of balance across all worlds in terms of the most essential game functionalities, features, and services. This way, game developers and world builders can iterate way faster than it was ever possible in traditional game development due to the continuously evolving standards, similar to EIPs for the EVM, governed by the owners and the communities of all these connected experiences.

One of these functionalities is leveling and an experience system, which could be applied to each NFT separately owned by each user.
Let's picture a simple scenario of how this could work in action: imagine Alice owning some NFTs and traveling around the Shapecraft universe.
Alice minted her ShapeXp Access Token and has access to its functions, which work like an inventory similar to inventories you might have had if you've played MMORPGs.
However, there is a major difference between Alice's inventory and those inventories you may have had in the past, because Alice can choose to lock some items
she likes into some of these inventory slots, and while interacting with different worlds in Shapecraft, these items can actually gain experience and level up,
and travel with her regardless of which worlds she enters. This is what I'd call a cross-world NFT experience system.

Let's say Yui, a world builder in Shapecraft, built her world in a way that implements the interface the ShapeXp engine provided, and now,
while she's implemented her own leveling system in her game, there are some implementations that can only be executed by users who have
leveled some specific items (defined by Yui's implementation) to a certain level. Thus, when Alice travels to Yui's game and carries her level 10 sword with her,
she can easily help out people struggling in Yui's world with a hard-to-beat boss, because that sword has a special implementation in Yui's game,
which throws a gigantic fireball, for instance, on the boss if Alice hits the boss with her sword (x) times.

## SHAPE XP - LOGIC FLOW PROTOTYPE

![ShapeXp_proto_0.1](https://github.com/ATrnd/ShapeXp/blob/main/img/ShapeXp_proto_0.1.jpg)


# **Changelog for ShapeXpNFT Test Suite**

## **[Version 0.1.0]**

### **Core Features**
- **Minting Functionality**:
  - Verified successful minting of a token and its ownership assignment.
  - Ensured unique token IDs for each mint, starting from 0.
  - Tested sequential minting to confirm no skipped token IDs.
- **Duplicate Mint Prevention**:
  - Added a test to revert minting attempts by addresses that have already minted a token.

### **Transfer Restrictions**
- Ensured transfers (`safeTransferFrom` and `transferFrom`) are fully blocked:
  - Added tests to emit `ShapeXpNFT__TransfersNotAllowed` for all transfer attempts.
- Validated that transfers using invalid inputs are blocked.

### **Approval Restrictions**
- Blocked all approval-related functionalities:
  - Prevented calls to `approve`, `setApprovalForAll`, and `isApprovedForAll`.
  - Ensured that these methods emit `ShapeXpNFT__ApprovalNotAllowed` upon invocation.
- Verified that `getApproved` always returns the zero address when no approvals are set.

### **Reentrancy Protection**
- Added test cases to ensure reentrancy is blocked during transfer attempts, emitting `ShapeXpNFT__TransfersNotAllowed`.

### **Ownership & Balance Validation**
- Verified ownership of minted tokens and the correct balance for each address.
- Ensured no ownership changes occur when transfer operations are blocked.

### **Miscellaneous**
- Introduced edge-case handling:
  - Tests for admin-level approvals to emit `ShapeXpNFT__ApprovalNotAllowed`.
  - Tests for invalid transfer attempts by non-owners.
- Ensured comprehensive error messaging for user feedback on invalid operations.


<!-- ROADMAP -->
## Roadmap

- [x] Project Vision README
- [ ] README Iteration
- [x] Access Token implementation
- [ ] Access Token Early Developer Access Implementations for Hardhat & Foundry
- [ ] Getting Started & Usage Guide
- [ ] Auxiliary contract implementation
- [ ] Inventory manager contract implementation
- [ ] Experience manager contract implementation
- [ ] Level manager contract implementation

### NFT Contract Development
- [x] ShapeXpNFT Core Contract
  - [x] Minting functionality for single-token minting per address.
  - [x] Custom errors for minting, transfers, and approvals (`ShapeXpNFT__AlreadyMinted`, `ShapeXpNFT__TransfersNotAllowed`, `ShapeXpNFT__ApprovalNotAllowed`).
  - [x] Restriction of transfers and approvals.
- [ ] Comprehensive Unit Tests for ShapeXpNFT
  - [x] Test minting functionality and ownership assignment.
  - [x] Test duplicate minting prevention.
  - [x] Test transfer restriction enforcement (`safeTransferFrom`, `transferFrom`).
  - [x] Test approval restriction enforcement (`approve`, `setApprovalForAll`).
  - [x] Test for `getApproved` default behavior (returns zero address).
  - [x] Test token ID uniqueness and sequential allocation.
  - [ ] Add edge-case testing for custom error handling.
- [ ] Integration Testing with other components.
  - [ ] Verify ShapeXpNFT compatibility with auxiliary contracts (e.g., inventory, experience manager).
  - [ ] Simulate user workflows for minting and querying token ownership.

### Contract Ecosystem Extensions
- [ ] Dynamic Minting Logic
  - [ ] Introduce minting restrictions or rewards based on external factors (e.g., level or experience).
  - [ ] Enable time-limited or event-based minting opportunities.
- [ ] Expand Error Handling
  - [ ] Add context-specific revert messages for invalid operations.
  - [ ] Standardize error reporting across the entire contract suite.

<!-- LICENSE -->
## License

Distributed under the MIT License.

<!-- CONTACT -->
## Contact

- Atrnd - atrnd.work@gmail.com
- Discord - hyper_eth
- Telegram - https://t.me/at_rnd
