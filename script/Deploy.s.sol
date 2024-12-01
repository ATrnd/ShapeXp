// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";
import {ShapeXpInvExp} from "../src/ShapeXpInvExp.sol";

contract ShapeXpNFTScript is Script {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInvExp public shapeXpInvExp;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        shapeXpNFT = new ShapeXpNFT();
        console.log("ShapeXpNFT deployed to:", address(shapeXpNFT));

        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
        console.log("ShapeXpInvExp deployed to:", address(shapeXpInvExp));

        console.log("\nDeployment Summary:");
        console.log("------------------");
        console.log("NFT Contract: %s", address(shapeXpNFT));
        console.log("InvExp Contract: %s", address(shapeXpInvExp));
        console.log("Deployer Address: %s", msg.sender);

        vm.stopBroadcast();
    }
}
