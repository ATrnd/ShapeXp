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
        shapeXpInvExp = new ShapeXpInvExp(address(shapeXpNFT));
        vm.stopBroadcast();
    }
}
