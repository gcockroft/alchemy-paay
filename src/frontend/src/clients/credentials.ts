import {
  AuthenticationCredential,
  RegistrationCredential,
} from "@simplewebauthn/typescript-types";
import base64url from "base64url";
import {decodeAttestationObject} from "../erc4337/parse/decodeAttestationObject";
import {parseAuthenticatorData} from "../erc4337/parse/parseAuthenticatorData";
import {decodeCredentialPublicKey} from "../erc4337/parse/decodeCredentialPublicKey";
import {COSEPublicKeyEC2} from "../erc4337/parse/cose";

export function storeCredentialId(credentialId: string) {
  // add the credentialId to the user's application storage
  localStorage.setItem("credentialId", credentialId);
}

export function getStoredCredentialId(): string | null {
  return localStorage.getItem("credentialId");
}

export async function createCredentials(
  user: PublicKeyCredentialUserEntity,
): Promise<{credentialId: string; publicKey: COSEPublicKeyEC2}> {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: {
        name: "Alchemy Wallet Services",
      },
      user,
      challenge,
      pubKeyCredParams: [{type: "public-key", alg: -7}],
      authenticatorSelection: {
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
    },
  })) as RegistrationCredential;

  const decodedAttestationObject = decodeAttestationObject(
    new Uint8Array(credential.response.attestationObject),
  );
  const authData = decodedAttestationObject.get("authData");
  const data = parseAuthenticatorData(authData);
  const publicKey = decodeCredentialPublicKey(data.credentialPublicKey!);

  return {
    credentialId: credential.id,
    publicKey,
  };
}

export async function testCredentialIds(credentialIds: string[]): Promise<{
  credentialId: string;
  publicKey: COSEPublicKeyEC2;
} | null> {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  for (const credentialId of credentialIds) {
    const allowCredentials: PublicKeyCredentialDescriptor[] = [
      {
        id: base64url.toBuffer(credentialId),
        transports: ["internal"],
        type: "public-key",
      },
    ];

    try {
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
        },
      })) as RegistrationCredential;

      const decodedAttestationObject = decodeAttestationObject(
        new Uint8Array(credential.response.attestationObject),
      );
      const authData = decodedAttestationObject.get("authData");
      const data = parseAuthenticatorData(authData);
      const publicKey = decodeCredentialPublicKey(data.credentialPublicKey!);

      return {
        credentialId: credential.id,
        publicKey,
      };
    } catch (e) {
      console.error("error", e);
    }
  }
  return null;
}

export async function getCredentials(
  buf: Uint8Array,
  credentialId: string,
): Promise<AuthenticationCredential> {
  let allowCredentials: PublicKeyCredentialDescriptor[] = [];
  if (credentialId !== undefined) {
    allowCredentials = [
      {
        id: base64url.toBuffer(credentialId),
        transports: ["internal"],
        type: "public-key",
      },
    ];
  }

  return (await navigator.credentials.get({
    publicKey: {
      challenge: buf,
      allowCredentials,
    },
  })) as AuthenticationCredential;
}
