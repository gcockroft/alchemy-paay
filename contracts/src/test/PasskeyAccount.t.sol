// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import {DSTest} from "ds-test/test.sol";
import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";
import {UserOperation, UserOperationLib} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {PasskeyAccountFactory} from "../accounts/PasskeyAccountFactory.sol";
import {PasskeyAccount} from "../accounts/PasskeyAccount.sol";
import {Secp256r1} from "../accounts/Secp256r1.sol";

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

contract PasskeyAccountTest is DSTest {
  PasskeyAccountFactory private _accountFactory;
  EntryPoint private _entryPoint;
  Vm private _vm = Vm(HEVM_ADDRESS);

  function setUp() public {
    _entryPoint = new EntryPoint();
    Secp256r1 curve = new Secp256r1();
    _accountFactory = new PasskeyAccountFactory(_entryPoint, address(curve));
  }

  function testCreation() public {
    address owner = address(1);
    string memory credentialID = "credential_id";
    string memory origin = "https://example.com";
    uint256[2] memory q = [uint256(1), uint256(2)];
    uint256 salt = 0;
    address counterFactual = _accountFactory.getAddress(owner, q, credentialID, origin, salt);
    PasskeyAccount account = _accountFactory.createAccount(owner, q, credentialID, origin, salt);
    assertEq(address(account), counterFactual);
  }

  function testAddPaskey() public {
    address owner = address(1);
    string memory credentialID = "credential_id";
    string memory origin = "https://example.com";
    uint256[2] memory q = [uint256(1), uint256(2)];
    uint256 salt = 0;
    address counterFactual = _accountFactory.getAddress(owner, q, credentialID, origin, salt);
    PasskeyAccount account = _accountFactory.createAccount(owner, q, credentialID, origin, salt);
    _vm.prank(counterFactual);
    account.addPasskey("credential_id2", origin, [uint256(3), uint256(4)]);
    _vm.prank(owner);
    account.addPasskey("credential_id3", origin, [uint256(5), uint256(6)]);
    _vm.prank(address(_entryPoint));
    account.addPasskey("credential_id4", origin, [uint256(7), uint256(8)]);
    address unknown = address(2);
    _vm.prank(unknown);
    _vm.expectRevert("account: not Owner, EntryPoint, or this");
    account.addPasskey("credential_id5", origin, [uint256(9), uint256(10)]);

  }
}