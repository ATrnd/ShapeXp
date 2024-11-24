// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ShapeXpNFT} from "../src/ShapeXpNFT.sol";
import {ShapeXpAUX} from "../src/ShapeXpAUX.sol";

contract ShapeXpNFTScript is Script {
    ShapeXpNFT public shapeXpNFT;
    ShapeXpAUX public shapeXpAUX;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        shapeXpNFT = new ShapeXpNFT();
        shapeXpAUX = new ShapeXpAUX(address(shapeXpNFT));
        vm.stopBroadcast();
    }
}
