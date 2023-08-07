import {createStandaloneToast} from "@chakra-ui/react";
import {Chain, polygon, polygonMumbai} from "viem/chains";
import {getVal} from "@alch-fam/shared";

export const CHAIN = getVal<Chain>(polygon, polygonMumbai);
export const BUNDLER_URL = "/api/rpc/proxy";
export const PAYMASTER_POLICY_ID = getVal(
  "6dc22bf3-17e3-4fc1-acb8-228ba35c36e3",
  "469689aa-4fdd-43bd-a721-697f7d5e2c5d",
);
export const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PASSKEY_OWNER_ADDRESS = getVal(
  "0x6faece8122de58fee2a07b1cba26efcf0131d9e4",
  "0xf7f00d283ce4cdbefd1a7c7c22d3e3b7189f2fd1",
);
export const PASSKEY_FACTORY_ADDRESS = getVal(
  "0x6739ecfdb523095f322f53f458a6f6bb9d4307cf",
  "0xcc3cb5d86d01120123805fea1a0886adf2194416",
);

export const OPEN_SEA_ROUTE = getVal(
  "https://opensea.io/assets/matic/",
  "https://testnets.opensea.io/assets/mumbai/",
);

export const POLYSCAN_ROUTE = getVal(
  "https://polygonscan.com/",
  "https://mumbai.polygonscan.com/",
);
const {ToastContainer: tc, toast: t} = createStandaloneToast();

export const ToastContainer = tc;
export const toast = t;
