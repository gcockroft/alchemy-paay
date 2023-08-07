import {CHAIN} from "../constants";

export function getUoExplorerUrl(uoHash: string) {
  return `https://www.jiffyscan.xyz/userOpHash/${uoHash}?network=${CHAIN.network}`;
}
