// SPDX-License-Identifier: UNLICENSED 

pragma solidity ^0.8.19;

/******************************************************************************
 ______     __         ______     __  __     ______     __    __     __  __   
/\  __ \   /\ \       /\  ___\   /\ \_\ \   /\  ___\   /\ "-./  \   /\ \_\ \  
\ \  __ \  \ \ \____  \ \ \____  \ \  __ \  \ \  __\   \ \ \-./\ \  \ \____ \ 
 \ \_\ \_\  \ \_____\  \ \_____\  \ \_\ \_\  \ \_____\  \ \_\ \ \_\  \/\_____\
  \/_/\/_/   \/_____/   \/_____/   \/_/\/_/   \/_____/   \/_/  \/_/   \/_____/
                                                          
******************************************************************************/

import {SimpleAccount} from "@account-abstraction/contracts/samples/SimpleAccount.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

import {PasskeyConfiguration} from "./PasskeyConfiguration.sol";
import {Secp256r1} from "./Secp256r1.sol";

contract PasskeyAccount is SimpleAccount {
    address public immutable ec;
    mapping(string => PasskeyConfiguration) public credIdToConfigs;

    constructor(IEntryPoint anEntryPoint, address anEllipticCurve) SimpleAccount(anEntryPoint) {
        ec = anEllipticCurve;
    }

    function initialize(address anOwner, uint256[2] memory _q, string memory _credentialID, string memory _origin)
        public
        virtual
        initializer
    {
        super._initialize(anOwner);
        credIdToConfigs[_credentialID] = PasskeyConfiguration(_q, _credentialID, _origin);
    }

    // Require the function call went through EntryPoint, this, or owner
    function _requireFromValidAdmin() internal view {
        require(
            msg.sender == address(entryPoint()) || 
            msg.sender == owner || 
            msg.sender == address(this), 
            "account: not Owner, EntryPoint, or this"
        );
    }

    // Wraps execution of a native function with runtime signature validation 
    modifier wrapNativeFunction() {
        _;
        _requireFromValidAdmin();
    }

    function addPasskey(
        string memory _credentialID,  
        string memory _origin, 
        uint256[2] memory _q
    ) public wrapNativeFunction {
        credIdToConfigs[_credentialID] = PasskeyConfiguration(_q, _credentialID, _origin);
    }

    bytes4 internal constant _MAGICVALUE = 0x1626ba7e;

    // EIP-1271
    function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue) {
        if (verifySignature(_signature, _hash) == 0) {
            return _MAGICVALUE;
        } else {
            return 0xffffffff;
        }
    }

    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        virtual
        override
        returns (uint256 sigTimeRange)
    {
        return verifySignature(userOp.signature, userOpHash);
    }

    struct ContentVerificationDataFull {
        bytes clientDataJSON;
        string webAuthnType;
        bytes challenge;
        string origin;
        bool crossOrigin;
    }

    function verifySignature(bytes memory signature, bytes32 msgHash)
        public
        view
        returns (uint256 sigTimeRange)
    {
        string memory credId;
        bytes memory authData;
        bytes memory clientDataJSON;
        uint256 signatureR;
        uint256 signatureS;
        (
            credId,
            authData, 
            clientDataJSON, 
            signatureR, 
            signatureS
        ) = abi.decode(signature, (string, bytes, bytes, uint256, uint256));

        // Check if mapping exists and fail if doesn't
        PasskeyConfiguration memory config = credIdToConfigs[credId];
        ContentVerificationDataFull memory verifData =
            ContentVerificationDataFull(clientDataJSON, "webauthn.get", bytes.concat(msgHash), config.origin, false);
        bool cdVerified = _verifyContentFull(verifData);

        uint256 e = uint256(sha256(bytes.concat(authData, sha256(clientDataJSON))));
        bool sigVerified = Secp256r1(ec).verify(config.q[0], config.q[1], e, signatureR, signatureS);
        return cdVerified && sigVerified ? 0 : SIG_VALIDATION_FAILED;
    }

    error ContentVerificationError(uint256 location, uint256 data0, uint256 data1, bytes data2, bytes data3);

    function _verifyContentFull(
        ContentVerificationDataFull memory verifData
    ) internal pure returns (bool) {
        bytes memory expected = bytes.concat(
            "{\"type\":\"",
            bytes(verifData.webAuthnType),
            "\",\"challenge\":\"",
            // Base64 text cannot contain non-UTF-8 chars, so no CCDToString needed
            bytes(_encodeBase64URL(verifData.challenge)), 
            "\",\"origin\":\"",
            bytes(verifData.origin),
            "\""
        );

        // Must be at least 1 char longer
        bool lengthVerified = verifData.clientDataJSON.length > expected.length;

        // Handle the case where the clientDataJSON is shorter than expected
        // this is only useful when lengthVerified == false and we don't
        // want to short circuit for gas estimation reasons with dummy signatures
        uint256 len = expected.length;
        if (verifData.clientDataJSON.length <= len) {
            len = verifData.clientDataJSON.length - 1;
        }

        // Verify the contents are the same up until this point
        bool contentVerified = true;
        for (uint256 i = 0; i < len; i++) {
            if (verifData.clientDataJSON[i] != expected[i]) {
                contentVerified = false;
            }
        }

        bytes1 nextChar = verifData.clientDataJSON[len];

        // Return true if the next char is either '}' or ','
        if (!(nextChar == "}" || nextChar == ",")) {
            contentVerified = false;
        }

        return lengthVerified && contentVerified;
    }

    /**
     * @dev Base64 Encoding/Decoding Table
     */
    string internal constant _TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    /**
     * @dev Converts a `bytes` to its Bytes64 `string` representation.
     */
    function _encodeBase64URL(bytes memory data) internal pure returns (string memory) {
        /**
         * Inspired by Brecht Devos (Brechtpd) implementation - MIT licence
         * https://github.com/Brechtpd/base64/blob/e78d9fd951e7b0977ddca77d92dc85183770daf4/base64.sol
         */
        if (data.length == 0) return "";

        // Loads the table into memory
        string memory table = _TABLE;

        // Encoding takes 3 bytes chunks of binary data from `bytes` data parameter
        // and split into 4 numbers of 6 bits.
        // The final Base64 length should be `bytes` data length multiplied by 4/3 rounded up
        // - `data.length + 2`  -> Round up
        // - `/ 3`              -> Number of 3-bytes chunks
        // - `4 *`              -> 4 characters for each chunk
        string memory result = new string(((data.length * 8 + 5) / 6));

        /// @solidity memory-safe-assembly
        assembly {
            // Prepare the lookup table (skip the first "length" byte)
            let tablePtr := add(table, 1)

            // Prepare result pointer, jump over length
            let resultPtr := add(result, 32)

            // Run over the input, 3 bytes at a time
            for {
                let dataPtr := data
                let endPtr := add(data, mload(data))
            } lt(dataPtr, endPtr) {} {
                // Advance 3 bytes
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                // To write each character, shift the 3 bytes (18 bits) chunk
                // 4 times in blocks of 6 bits for each character (18, 12, 6, 0)
                // and apply logical AND with 0x3F which is the number of
                // the previous character in the ASCII table prior to the Base64 Table
                // The result is then added to the table to get the character to write,
                // and finally write it in the result pointer but with a left shift
                // of 256 (1 byte) - 8 (1 ASCII char) = 248 bits

                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance

                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1) // Advance
            }
        }

        return result;
    }
}
