// SPDX-License-Identifier: UNLICENSED 

pragma solidity ^0.8.19;

/******************************************************************************
 ______     __         ______     __  __     ______     __    __     __  __   
/\  __ \   /\ \       /\  ___\   /\ \_\ \   /\  ___\   /\ "-./  \   /\ \_\ \  
\ \  __ \  \ \ \____  \ \ \____  \ \  __ \  \ \  __\   \ \ \-./\ \  \ \____ \ 
 \ \_\ \_\  \ \_____\  \ \_____\  \ \_\ \_\  \ \_____\  \ \_\ \ \_\  \/\_____\
  \/_/\/_/   \/_____/   \/_____/   \/_/\/_/   \/_____/   \/_/  \/_/   \/_____/
                                                                              
******************************************************************************/

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

import {PasskeyAccount} from "./PasskeyAccount.sol";

contract PasskeyAccountFactory {
    PasskeyAccount public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint, address _anEllipticCurve) {
        accountImplementation = new PasskeyAccount(_entryPoint, _anEllipticCurve);
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress()
     * would work even after account creation
     */
    function createAccount(
        address owner,
        uint256[2] memory q,
        string memory credentialID,
        string memory origin,
        uint256 salt
    ) public returns (PasskeyAccount ret) {
        address addr = getAddress(owner, q, credentialID, origin, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return PasskeyAccount(payable(addr));
        }
        ret = PasskeyAccount(
            payable(
                new ERC1967Proxy{salt : bytes32(salt)}(
                address(accountImplementation),
                abi.encodeCall(PasskeyAccount.initialize, (owner, q, credentialID, origin))
                )
            )
        );
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address owner,
        uint256[2] memory q,
        string memory credentialID,
        string memory origin,
        uint256 salt
    ) public view returns (address) {
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(
                        address(accountImplementation),
                        abi.encodeCall(PasskeyAccount.initialize, (owner, q, credentialID, origin))
                    )
                )
            )
        );
    }
}