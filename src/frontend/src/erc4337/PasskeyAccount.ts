import {hexConcat} from "@ethersproject/bytes";
import {
  Address,
  encodeFunctionData,
  type FallbackTransport,
  type Transport,
} from "viem";
import {P256Signer} from "./P256Signer";
import {PasskeyAccountAbi, PasskeyAccountFactoryAbi} from "./PasskeyAccountAbi";
import {
  BaseSmartAccountParams,
  BaseSmartContractAccount,
  BatchUserOperationCallData,
} from "@alchemy/aa-core";

export interface PasskeyAccountParams<
  TTransport extends Transport | FallbackTransport = Transport,
> extends BaseSmartAccountParams<TTransport> {
  owner: P256Signer;
  ownerAddress?: Address;
  index?: number;
  origin: string;
  factoryAddress: Address;
}

export class PasskeyAccount<
  TTransport extends Transport | FallbackTransport = Transport,
> extends BaseSmartContractAccount<TTransport> {
  private owner: P256Signer;
  private ownerAddress?: Address;
  private origin: string;
  private factoryAddress: Address;
  private index: number;

  constructor(params: PasskeyAccountParams) {
    super(params);
    this.owner = params.owner;
    this.ownerAddress = params.ownerAddress;
    this.factoryAddress = params.factoryAddress;
    this.origin = params.origin;
    this.index = params.index ?? 0;
  }

  getAddress(): Promise<`0x${string}`> {
    if (this.ownerAddress) {
      return Promise.resolve(this.ownerAddress);
    } else {
      return super.getAddress();
    }
  }

  async getAccountInitCode(): Promise<`0x${string}`> {
    const credID = await this.owner.getCredentialID();
    if (credID === undefined) {
      throw new Error("no credentialID");
    }
    const owner = this.ownerAddress ?? (await this.owner.getAddress());
    const publicKey = await this.owner.getPublicKey();

    return hexConcat([
      this.factoryAddress,
      encodeFunctionData({
        abi: PasskeyAccountFactoryAbi,
        functionName: "createAccount",
        // @ts-expect-error viem converts uint256 in abi to bigint type, but uint256 should be the hex representation of the bigint which is a string
        args: [owner, publicKey, credID, this.origin, this.index],
      }),
    ]) as `0x${string}`;
  }

  async signMessage(msg: Uint8Array): Promise<`0x${string}`> {
    const signedMessage = await this.owner.signMessage(msg);
    return signedMessage as `0x${string}`;
  }

  getDummySignature(): `0x${string}` {
    return "0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160b2ad06df0b51a4a10837ced52ec47bd8a001e898092be5395b2ceb23687684891889d7e1bc8906a39cb10c95598f15bb44517e3ccac40937da92479f5b51cf02000000000000000000000000000000000000000000000000000000000000002b726f454b5857655a324d5a52665a4869524745315468486d687866666e685f5f52314c72676e396c483563000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000957b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2263306877567a5130566b74595a464258526b7777534739784d6931464d5770525a54467855584a31645555744e55307761324642546e6c555451222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a38303830222c2263726f73734f726967696e223a66616c73657d0000000000000000000000";
  }

  async encodeExecute(
    target: `0x${string}`,
    value: bigint,
    data: `0x${string}`,
  ): Promise<`0x${string}`> {
    return Promise.resolve(
      encodeFunctionData({
        abi: PasskeyAccountAbi,
        functionName: "execute",
        args: [target, value, data],
      }),
    );
  }

  override async encodeBatchExecute(
    _txs: BatchUserOperationCallData,
  ): Promise<`0x${string}`> {
    throw Error("Passkey acounts don't support batchExecute yet.");
  }
}
