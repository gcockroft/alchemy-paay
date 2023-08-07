import {Provider} from "@ethersproject/abstract-provider";
import {Bytes, defaultAbiCoder as abi, arrayify} from "ethers/lib/utils";

import {P256Signer} from "./P256Signer";
import {COSEKEYS, COSEPublicKeyEC2} from "./parse/cose";
import {unwrapEC2Signature} from "./parse/iso/isoCrypto/unwrapEC2Signature";
import {createCredentials, getCredentials} from "../clients/credentials";

export class PasskeySigner extends P256Signer {
  provider?: Provider;
  credentialId: string;
  publicKey?: COSEPublicKeyEC2;

  constructor(
    credentialId: string,
    publicKey?: COSEPublicKeyEC2,
    provider?: Provider,
  ) {
    super();
    this.credentialId = credentialId;
    this.publicKey = publicKey;
    this.provider = provider;
  }

  connect(provider: Provider): PasskeySigner {
    return new PasskeySigner(this.credentialId, this.publicKey, provider);
  }

  async signMessage(message: Bytes | string): Promise<string> {
    if (typeof message === "string" && message.substring(0, 2) !== "0x") {
      message = new TextEncoder().encode(message);
    }
    const buf = arrayify(message);
    const credential = await getCredentials(buf, this.credentialId);
    const unwrappedSig = unwrapEC2Signature(
      new Uint8Array(credential.response.signature),
    );

    const sig = abi.encode(
      ["string", "bytes", "bytes", "uint256", "uint256"],
      [
        this.credentialId,
        new Uint8Array(credential.response.authenticatorData),
        new Uint8Array(credential.response.clientDataJSON),
        unwrappedSig.slice(0, 32),
        unwrappedSig.slice(32, 64),
      ],
    );
    return sig;
  }

  async getPublicKeyCoordinates(): Promise<[Buffer, Buffer]> {
    const x = this.publicKey!.get(COSEKEYS.x)!;
    const y = this.publicKey!.get(COSEKEYS.y)!;
    return [Buffer.from(x), Buffer.from(y)];
  }

  async getCredentialID(): Promise<string | undefined> {
    return this.credentialId;
  }

  static async create(
    user: PublicKeyCredentialUserEntity,
  ): Promise<PasskeySigner> {
    const creds = await createCredentials(user);
    return new PasskeySigner(creds.credentialId, creds.publicKey);
  }

  static async load(
    credentialId: string,
    publicKey?: COSEPublicKeyEC2,
  ): Promise<PasskeySigner> {
    return new PasskeySigner(credentialId, publicKey);
  }
}
