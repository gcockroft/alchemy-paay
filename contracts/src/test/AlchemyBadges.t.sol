// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import {DSTest} from "ds-test/test.sol";
import {AlchemyBadges} from "../badges/AlchemyBadges.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

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

contract AlchemyBadgesTest is DSTest {
  AlchemyBadges private _alchemyBadges;
  Vm private _vm = Vm(HEVM_ADDRESS);

  function setUp() public {
    _alchemyBadges = new AlchemyBadges(false);
  }

  function testInitialState() public {
    assertTrue(_alchemyBadges.isExecutor(address(this)));
    assertEq(_alchemyBadges.mintPassBadgeId(), 0);
    assertEq(_alchemyBadges.badgeCount(), 0);
  }

  function testSetExecutor() public {
    address admin = address(1);
    assertTrue(!_alchemyBadges.isExecutor(admin));
    _alchemyBadges.setExecutor(admin, true);
    assertTrue(_alchemyBadges.isExecutor(admin));
    _alchemyBadges.setExecutor(admin, false);
    assertTrue(!_alchemyBadges.isExecutor(admin));

    address notTheOwner = address(2);
    _vm.prank(notTheOwner);
    _vm.expectRevert("Caller is not an Executor");
    _alchemyBadges.setExecutor(admin, true);
  }

  function testSetBadgeSpec() public {
    string memory inputUri = "uri";
    uint256 tokenId = 1;
    _alchemyBadges.setBadgeSpec(tokenId, inputUri, false, false);
    (string memory uri, , ) = _alchemyBadges.badgeSpecs(tokenId);
    assertEq(uri, inputUri);

    string memory uriGetterResult = _alchemyBadges.uri(tokenId);
    assertEq(uriGetterResult, inputUri);
  }

  function testExecutorMint() public {
    uint256 tokenId = 1;
    _alchemyBadges.setBadgeSpec(tokenId, "uri", false, false);

    address to = address(1);
    uint256 amount = 1;
    _alchemyBadges.mintBadge(to, tokenId, amount, "");
    assertEq(_alchemyBadges.balanceOf(to, tokenId), amount);
  }

  function testCounter() public {
    uint256 a = _alchemyBadges.badgeCount();
    _alchemyBadges.incrementBadgeCounter();
    assertEq(_alchemyBadges.badgeCount(), a + 1);
  }

  function testSoulboundTransfer() public {
    uint256 tokenId = 1;
    _alchemyBadges.setBadgeSpec(tokenId, "uri", false, true);
    address user = address(1);
    uint256 amount = 1;
    _alchemyBadges.mintBadge(user, tokenId, amount, "");

    address anotherUser = address(2);
    _vm.prank(user);
    _vm.expectRevert("Soulbounds are not transferrable");
    _alchemyBadges.safeTransferFrom(user, anotherUser, tokenId, amount, "");

    // Soulbounds should still be burnable.
    _vm.prank(user);
    _alchemyBadges.burn(user, tokenId, amount);
    assertEq(_alchemyBadges.balanceOf(user, tokenId), 0);
  }

  function testTransferDuringPause() public {
    uint256 tokenId = 1;
    _alchemyBadges.setBadgeSpec(tokenId, "uri", false, false);
    uint256 amount = 1;
    address user = address(1);
    _alchemyBadges.mintBadge(user, tokenId, amount, "");

    _alchemyBadges.pause();
    address anotherUser = address(2);
    _vm.prank(user);
    // Hex value for EnforcePaused() error message.
    _vm.expectRevert(abi.encodePacked(hex"d93c0665"));
    _alchemyBadges.safeTransferFrom(user, anotherUser, tokenId, amount, "");
  }
}
