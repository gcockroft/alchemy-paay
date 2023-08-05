// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import {DSTest} from "ds-test/test.sol";
import {AlchemyBadges} from "../badges/AlchemyBadges.sol";
import {AlchemyBadgesOperator} from "../badges/AlchemyBadgesOperator.sol";

interface Vm {
  function expectEmit(
    bool,
    bool,
    bool,
    bool
  ) external;

  function expectRevert(bytes calldata) external;

  function prank(address) external;
}

contract AlchemyBadgesOperatorTest is DSTest {
  AlchemyBadges private _badges;
  AlchemyBadgesOperator private _operator;
  Vm private _vm = Vm(HEVM_ADDRESS);

  function setUp() public {
    _badges = new AlchemyBadges(false);
    _operator = new AlchemyBadgesOperator(address(_badges));
    _badges.setExecutor(address(_operator), true);
  }

  function testInitialState() public {
    assertTrue(_badges.isExecutor(address(this)));
    assertTrue(_badges.isExecutor(address(_operator)));
    assertEq(_badges.mintPassBadgeId(), 0);
  }

  function testMintPassHolderMint() public {
    // First, create the mint pass spec and mint it.
    uint256 mintPassTokenId = 1;
    _badges.setBadgeSpec(mintPassTokenId, "uri", false, false);
    _badges.setMintPass(mintPassTokenId);
    address to = address(1);
    _operator.mintPass(to);

    // Next, create a new token spec and have the mint pass holder mint it.
    uint256 badgeId = 2;
    _badges.setBadgeSpec(badgeId, "uri2", true, false);
    _vm.prank(to);
    _operator.mintBadge(badgeId, 1);
    assertEq(_badges.balanceOf(to, badgeId), 1);
  }

  function testNonMintPassHolderMint() public {
    // First, create the mint pass spec and mint it.
    uint256 mintPassTokenId = 1;
    _badges.setBadgeSpec(mintPassTokenId, "uri", false, false);
    _badges.setMintPass(mintPassTokenId);
    address to = address(1);

    // Next, create a new token spec and have the mint pass holder mint it.
    uint256 badgeId = 2;
    _badges.setBadgeSpec(badgeId, "uri2", true, false);
    _vm.prank(to);
    _vm.expectRevert("Mint pass not found");
    _operator.mintBadge(badgeId, 1);
  }

  function testAddBadge() public {
    // setup account
    uint256 mintPassTokenId = 1;
    address to = address(1);
    _badges.setBadgeSpec(mintPassTokenId, "uri", false, false);
    _badges.setMintPass(mintPassTokenId);
    _operator.mintPass(to);
    _badges.incrementBadgeCounter();

    // Create a new token spec and have the mint pass holder create it.
    _vm.prank(to);
    assertEq(_badges.badgeCount(), 1);
    _operator.addBadge("uriBadge");
    assertEq(_badges.badgeCount(), 2);
    (string memory uri, , ) = _badges.badgeSpecs(2);
    assertEq(uri, "uriBadge");
  }

  function testAddBadgeNonOwner() public {
    // setup accounts
    uint256 mintPassTokenId = 1;
    address creator = address(1);
    address reciever = address(2);
    _badges.setBadgeSpec(mintPassTokenId, "uri", false, false);
    _badges.setMintPass(mintPassTokenId);
    _operator.mintPass(creator);
    _operator.mintPass(reciever);
    _badges.incrementBadgeCounter();

    // Create a new token spec and have the mint pass holder create it.
    _vm.prank(creator);
    _operator.addBadge("uriBadge");

    // Next, have the reciever mint the badge.
    _vm.prank(reciever);
    uint256 amount = 1;
    uint256 tokenId = 2;
    _operator.mintBadge(tokenId, amount);
    assertEq(_badges.balanceOf(reciever, tokenId), amount);
    (string memory uri, , ) = _badges.badgeSpecs(2);
    assertEq(uri, "uriBadge");
  }

  function testAddBadgeContractMint() public {
    // setup account
    uint256 mintPassTokenId = 1;
    address to = address(1);
    address to2 = address(2);
    _badges.setBadgeSpec(mintPassTokenId, "uri", false, false);
    _badges.setMintPass(mintPassTokenId);
    _badges.incrementBadgeCounter();
    _operator.mintPass(to);
    _operator.mintPass(to2);
    // Create a new token spec and have the mint pass holder create it.
    uint256 tokenId = 2;
    _vm.prank(to);
    _operator.addBadge("uriBadge");
    assertEq(_badges.badgeCount(), tokenId);
    
    _vm.prank(to2);
    _operator.mintBadge(tokenId, 1);
    assertEq(_badges.balanceOf(address(_badges), tokenId), 1);
  }
}
