import WebCrypto from "@simplewebauthn/iso-webcrypto";
import base64url from "base64url";
import {COSEKEYS, COSEPublicKeyEC2} from "./cose";
import {unwrapEC2Signature} from "./iso/isoCrypto/unwrapEC2Signature";

export async function verifySignature(
  signature: Uint8Array,
  message: Uint8Array,
  pk: COSEPublicKeyEC2,
) {
  // const alg = pk.get(COSEKEYS.alg)!;
  // const crv = pk.get(COSEKEYS.crv)!;
  const x = pk.get(COSEKEYS.x)!;
  const y = pk.get(COSEKEYS.y)!;

  const unwraped = unwrapEC2Signature(signature);

  const keyData: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: base64url.encode(Buffer.from(x)),
    y: base64url.encode(Buffer.from(y)),
    ext: false,
  };

  const key = await WebCrypto.subtle.importKey(
    "jwk",
    keyData,
    {name: "ECDSA", namedCurve: "P-256"},
    false,
    ["verify"],
  );

  return WebCrypto.subtle.verify(
    {name: "ECDSA", hash: {name: "SHA-256"}},
    key,
    unwraped,
    message,
  );
}

export async function verifySignatureRaw(
  signature: Uint8Array,
  message: Uint8Array,
  pk: COSEPublicKeyEC2,
) {
  // const alg = pk.get(COSEKEYS.alg)!;
  // const crv = pk.get(COSEKEYS.crv)!;
  const x = pk.get(COSEKEYS.x)!;
  const y = pk.get(COSEKEYS.y)!;

  const keyData: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: base64url.encode(Buffer.from(x)),
    y: base64url.encode(Buffer.from(y)),
    ext: false,
  };

  const key = await WebCrypto.subtle.importKey(
    "jwk",
    keyData,
    {name: "ECDSA", namedCurve: "P-256"},
    false,
    ["verify"],
  );

  return WebCrypto.subtle.verify(
    {name: "ECDSA", hash: {name: "SHA-256"}},
    key,
    signature,
    message,
  );
}
