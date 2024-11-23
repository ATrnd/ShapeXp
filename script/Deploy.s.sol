// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";

contract ShapeXpNFTScript is Script {
    ShapeXpNFT public shapeXpNFT;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        // No need to pass msg.sender as the Ownable constructor will handle it
        shapeXpNFT = new ShapeXpNFT(); // Deploying without constructor arguments
        vm.stopBroadcast();
    }
}
