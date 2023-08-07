import {PublicErc4337Client, SmartAccountProvider} from "@alchemy/aa-core";
import {Chain} from "viem";
import {AddressUpdateResponse, Member} from "../../declarations/api";
import {Link, Text} from "@chakra-ui/react";
import React from "react";
import {PasskeySigner} from "../../erc4337/PasskeySigner";
import {MultiActionStep} from "../../components/common/MultiAction";
import {getUoExplorerUrl} from "../../util/ops";

// .01 in wei
export const MIN_ONBOARDING_WALLET_BALANCE = BigInt("10000000000000000");

export interface OnboardingConfiguration {
  badgeContractAddress: `0x${string}`;
  simpleAccountFactoryAddress: `0x${string}`;
  gasManagerPolicyId: string;
  rpcUrl: string;
  chain: Chain;
  client: PublicErc4337Client;
}

export interface OnboardingContext {
  member: Member;
  accountAddress: `0x${string}`;
  credentialId: string;
  passkeySigner: PasskeySigner;
  passkeyProvider: SmartAccountProvider;
  entrypointAddress: `0x${string}`;
  faamTxnHash: `0x${string}`;
  mintDeployTxnHash: `0x${string}`;
  addressUpdateResponse: AddressUpdateResponse;
}

export type OnboardingStep = MultiActionStep<
  OnboardingStepIdentifier,
  OnboardingContext
>;

export enum OnboardingStepIdentifier {
  INITIAL_STEP,
  GET_ENTRYPOINT,
  GEN_PASSKEY,
  GEN_CREDENTIALS,
  MINT_FAAM_NFT,
  CHECK_FAAM_NFT,
  CREATE_WALLET_AND_BADGES,
  CHECK_WALLET_AND_BADGES,
  UPDATE_MEMBER_ADDRESS,
  DONE,
}

export function initialStep(member: Member, chain: Chain): OnboardingStep {
  const meta = metaForStepIdentifier(
    OnboardingStepIdentifier.INITIAL_STEP,
    {},
    chain,
  );
  return {
    ...meta,
    identifier: OnboardingStepIdentifier.INITIAL_STEP,
    context: {
      member,
    },
  };
}

function WaitingForFAAMOpStep({
  blockExplorer,
  children,
}: React.PropsWithChildren<{blockExplorer: string}>) {
  return (
    <>
      <Text>
        Waiting for your operation to complete.
        <br />
        <Link href={`${blockExplorer}`} target="_blank">
          Click here to track the progress!
        </Link>{" "}
      </Text>
      {children}
    </>
  );
}

export function metaForStepIdentifier(
  step: OnboardingStepIdentifier,
  context: Partial<OnboardingContext>,
  chain: Chain,
) {
  switch (step) {
    case OnboardingStepIdentifier.INITIAL_STEP:
      return {
        percent: 0,
        description:
          "Pulling together current information for account creation.",
        title: "Gathering Information",
      };
    case OnboardingStepIdentifier.GET_ENTRYPOINT:
      return {
        percent: 10,
        description: "Fetching the entrypoint address for the account.",
        title: "Fetching Entrypoint",
      };
    case OnboardingStepIdentifier.GEN_PASSKEY:
      return {
        percent: 20,
        description:
          "Generating the passkey request for your account. You will be prompted for your authentication.",
        title: "Generating Passkey and Address",
      };
    case OnboardingStepIdentifier.GEN_CREDENTIALS:
      return {
        percent: 30,
        description: "Generating your address and signature credentials.",
        title: "Generating Passkey and Address",
      };
    case OnboardingStepIdentifier.MINT_FAAM_NFT:
      return {
        percent: 40,
        description: "Minting the offical Alchemy FAAM account badge.",
        title: "Account FAAM Pass",
      };
    case OnboardingStepIdentifier.CHECK_FAAM_NFT:
      return {
        percent: 50,
        description: (
          <WaitingForFAAMOpStep
            blockExplorer={`${chain.blockExplorers?.default
              ?.url!}/search?q=${context.faamTxnHash!}`}
          />
        ),
        title: `Waiting for user op completion.`,
      };
    case OnboardingStepIdentifier.CREATE_WALLET_AND_BADGES:
      return {
        percent: 65,
        description:
          "Creating your wallet and minting any earned badges. You will be prompted for your authentication.",
        title: "Wallet and Badges",
      };
    case OnboardingStepIdentifier.CHECK_WALLET_AND_BADGES:
      return {
        percent: 75,
        description: (
          <WaitingForFAAMOpStep
            blockExplorer={getUoExplorerUrl(context.mintDeployTxnHash!)}
          />
        ),
        title: `Waiting for user op completion.`,
      };
    case OnboardingStepIdentifier.UPDATE_MEMBER_ADDRESS:
      return {
        percent: 85,
        description: "Updating your member address to complete onboarding!",
        title: "Final Steps",
      };
    case OnboardingStepIdentifier.DONE:
      return {
        percent: 100,
        description:
          "Completed onboarding!! Exit this modal to go to your new profile! 👀",
        title: "Done 🔥",
      };
  }
}
