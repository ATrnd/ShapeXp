// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";
import {ShapeXpInv} from "../src/ShapeXpInv.sol";

contract ShapeXpNFTScript is Script {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpInv public shapeXpInv;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        shapeXpNFT = new ShapeXpNFT();
        shapeXpInv = new ShapeXpInv(address(shapeXpNFT));
        vm.stopBroadcast();
    }
}
