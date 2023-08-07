import {Signer} from "ethers";
import {arrayify, hexlify, keccak256} from "ethers/lib/utils";
import {Address} from "viem";

export abstract class P256Signer extends Signer {
  protected abstract getPublicKeyCoordinates(): Promise<[Buffer, Buffer]>;

  async signTransaction(): Promise<string> {
    throw new Error("P256Signer cannot signTransaction");
  }

  async getAddress(): Promise<Address> {
    const [x, y] = await this.getPublicKeyCoordinates();
    const pk = hexlify(Buffer.concat([x, y]));
    return hexlify(arrayify(keccak256(pk)).slice(-20)) as Address;
  }

  async getPublicKey(): Promise<[string, string]> {
    const [x, y] = await this.getPublicKeyCoordinates();
    return [hexlify(x), hexlify(y)];
  }

  async getCredentialID(): Promise<string | undefined> {
    return undefined;
  }
}
