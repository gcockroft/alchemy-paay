import { COSEPublicKeyEC2 } from './cose';
import { isoCBOR } from './iso';

export function decodeCredentialPublicKey(
  publicKey: Uint8Array
): COSEPublicKeyEC2 {
  return isoCBOR.decodeFirst<COSEPublicKeyEC2>(publicKey);
}
