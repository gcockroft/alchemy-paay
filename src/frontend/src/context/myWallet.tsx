import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {LoadingScreen} from "../screens/LoadingScreen";
import {ErrorScreen} from "../screens/ErrorScreen";
import {PasskeyAccount} from "../erc4337/PasskeyAccount";
import {useMe} from "./me";
import {PasskeySigner} from "../erc4337/PasskeySigner";
import {
  createPublicErc4337Client,
  SmartAccountProvider,
} from "@alchemy/aa-core";
import {
  BUNDLER_URL,
  CHAIN,
  PASSKEY_FACTORY_ADDRESS,
  PAYMASTER_POLICY_ID,
} from "../constants";
import {alchemyPaymasterAndDataMiddleware} from "@alchemy/aa-alchemy";
import {AppMemberStatus, Me} from "../declarations/api";

const MyWalletContext = createContext<
  {walletProivder: SmartAccountProvider; address: `0x${string}`} | undefined
>(undefined);

async function genPasskeyProvider(me: Me) {
  const client = createPublicErc4337Client({
    chain: CHAIN,
    rpcUrl: BUNDLER_URL,
  });
  const entrypoints = await client.getSupportedEntryPoints();

  if (entrypoints.length === 0) {
    throw new Error("No entrypoints found");
  }

  if (!me.credentialContext) {
    throw new Error("No credential context found");
  }

  if (me.status !== AppMemberStatus.LOGGED_IN) {
    throw new Error("User is not logged in");
  }

  const entrypoint = entrypoints[0];
  const passkeySigner = await PasskeySigner.load(me.credentialId);
  const passkeyProvider = new SmartAccountProvider(
    BUNDLER_URL,
    entrypoint,
    CHAIN,
  )
    .withPaymasterMiddleware(
      alchemyPaymasterAndDataMiddleware({
        provider: client,
        policyId: PAYMASTER_POLICY_ID,
        entryPoint: entrypoint,
      }),
    )
    .connect((client) => {
      return new PasskeyAccount({
        ownerAddress: me.ethAddress as `0x${string}`,
        chain: CHAIN,
        rpcClient: client,
        entryPointAddress: entrypoint,
        factoryAddress: PASSKEY_FACTORY_ADDRESS,
        origin: window.location.origin,
        owner: passkeySigner,
      });
    });
  return passkeyProvider;
}

export const MyWalletProvider = ({children}: PropsWithChildren) => {
  const me = useMe();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [walletProivder, setWalletProivder] = useState<
    SmartAccountProvider | undefined
  >(undefined);
  const address = me.ethAddress as `0x${string}`;

  useEffect(() => {
    setLoading(true);
    if (me.status !== AppMemberStatus.LOGGED_IN) {
      setLoading(false);
      return;
    }
    genPasskeyProvider(me)
      .then((passkeyProvider) => {
        setWalletProivder(passkeyProvider);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [me.credentialContext]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={`${error}` ?? "Unknown error occured"} />;
  }

  if (!address || !me.credentialContext || !walletProivder) {
    return <>{children}</>;
  }

  return (
    <MyWalletContext.Provider value={{walletProivder, address}}>
      {children}
    </MyWalletContext.Provider>
  );
};

export const useMyWallet = () => {
  const myWallet = useContext(MyWalletContext);
  if (!myWallet)
    throw new Error(
      "useMyWallet must be used within a MyProviderProvider that has an onboarded user",
    );
  return myWallet;
};
