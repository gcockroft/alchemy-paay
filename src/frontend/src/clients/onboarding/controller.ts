import {useCallback, useMemo, useState} from "react";
import {
  SmartAccountProvider,
  createPublicErc4337Client,
} from "@alchemy/aa-core";
import {alchemyPaymasterAndDataMiddleware} from "@alchemy/aa-alchemy";
import {
  OnboardingConfiguration,
  OnboardingContext,
  OnboardingStep,
  OnboardingStepIdentifier,
  initialStep,
  metaForStepIdentifier,
} from "./DataModels";
import {Member} from "../../declarations/api";
import {
  BUNDLER_URL,
  CHAIN,
  PASSKEY_FACTORY_ADDRESS,
  PAYMASTER_POLICY_ID,
} from "../../constants";
import {PasskeyAccount} from "../../erc4337/PasskeyAccount";
import {PasskeySigner} from "../../erc4337/PasskeySigner";
import {arrayify} from "@ethersproject/bytes";
import {mintFamPass, updateMemberAddress} from "../../http/endpoints";
import {pollForLambdaForComplete} from "../../util/poll";
import {encodeFunctionData} from "viem";
import {
  ALCHEMY_BADGE_OPERATOR_ADDRESS,
  alchemyBadgesOperatorABI,
} from "@alch-fam/shared";

type OnboardingFunction = (
  context: Partial<OnboardingContext>,
  config: OnboardingConfiguration,
) => Promise<{
  nextStep: OnboardingStepIdentifier;
  addedContext: Partial<OnboardingContext>;
}>;

const onboardingStepHandlers: Record<
  OnboardingStepIdentifier,
  OnboardingFunction
> = {
  // This is the first step it checks for the member.
  [OnboardingStepIdentifier.INITIAL_STEP]: async (context) => {
    if (!context.member) {
      throw new Error("No member was found");
    }
    return {
      nextStep: OnboardingStepIdentifier.GET_ENTRYPOINT,
      addedContext: {},
    };
  },
  // This step gets the entrypoint for the smart account.
  [OnboardingStepIdentifier.GET_ENTRYPOINT]: async (_, config) => {
    const entrypointAddress = await config
      .client!.getSupportedEntryPoints()
      .then((entrypoints) => {
        if (entrypoints.length === 0) {
          throw new Error("No entrypoints found");
        }
        return entrypoints[0];
      });
    return {
      nextStep: OnboardingStepIdentifier.GEN_PASSKEY,
      addedContext: {
        entrypointAddress,
      },
    };
  },
  /*
   * `GEN_PASSKEY` will generate a passkey signer and account. This will be used
   * to create the smart contract wallet for the account by calling the factory contract.
   * As well as setup the smart account signer, with a paymaster middleware.
   */
  [OnboardingStepIdentifier.GEN_PASSKEY]: async (context, config) => {
    const passkeySigner = await PasskeySigner.create({
      displayName: context.member!.email,
      id: arrayify(context.member!.id),
      name: `${context.member!.firstName} ${context.member!.lastName}`,
    });

    if (!context.entrypointAddress) {
      throw new Error("No entrypoint address was found");
    }
    const entryPointAddress = context.entrypointAddress;
    const passkeyProvider = new SmartAccountProvider(
      config.rpcUrl,
      context.entrypointAddress!,
      config.chain!,
    )
      .withPaymasterMiddleware(
        alchemyPaymasterAndDataMiddleware({
          provider: config.client!,
          policyId: config.gasManagerPolicyId,
          entryPoint: entryPointAddress,
        }),
      )
      .connect((client) => {
        return new PasskeyAccount({
          chain: config.chain,
          rpcClient: client,
          entryPointAddress: context.entrypointAddress!,
          factoryAddress: config.simpleAccountFactoryAddress,
          origin: window.location.origin,
          owner: passkeySigner,
        });
      });

    return {
      nextStep: OnboardingStepIdentifier.GEN_CREDENTIALS,
      addedContext: {
        passkeyProvider,
        passkeySigner,
      },
    };
  },
  /*
   * `GEN_CREDENTIALS` will generate an address and credentials for the passkey signer and account. This will be used
   * to identify the smart contract wallet for the account by calling the counterfactuial.
   */
  [OnboardingStepIdentifier.GEN_CREDENTIALS]: async (context) => {
    const {passkeyProvider, passkeySigner} = context;
    const accountAddress = await passkeyProvider?.account!.getAddress();
    const credentialId = await passkeySigner!.getCredentialID().then((x) => {
      if (x) {
        return x;
      }

      throw new Error("No credential ID found!");
    });
    return {
      nextStep: OnboardingStepIdentifier.MINT_FAAM_NFT,
      addedContext: {
        accountAddress,
        credentialId,
      },
    };
  },
  /*
   * This step calls the backend to mint the FAAM NFT for the newly generated account address.
   */
  [OnboardingStepIdentifier.MINT_FAAM_NFT]: async (context) => {
    const {accountAddress} = context;
    const faamTxnHash = await mintFamPass(accountAddress!);
    return {
      nextStep: OnboardingStepIdentifier.CHECK_FAAM_NFT,
      addedContext: {
        faamTxnHash,
      },
    };
  },
  /*
   * This step checks to see that the FAAM NFT has been correctly minted to the generated account address.
   */
  [OnboardingStepIdentifier.CHECK_FAAM_NFT]: async (context, config) => {
    const {faamTxnHash} = context;
    await pollForLambdaForComplete(async () => {
      return config.client
        .getTransactionReceipt({
          hash: faamTxnHash!,
        })
        .then((receipt) => {
          return receipt !== null;
        })
        .catch(() => {
          return false;
        });
    });
    return {
      nextStep: OnboardingStepIdentifier.CREATE_WALLET_AND_BADGES,
      addedContext: {},
    };
  },
  /*
   * This step will deploy the smart contract wallet for the account by
   * calling the factory contract. As well as mint an initial badge for
   * the smart account, with the paymaster middleware.
   */
  [OnboardingStepIdentifier.CREATE_WALLET_AND_BADGES]: async (
    context,
    config,
  ) => {
    const result = await context.passkeyProvider?.sendUserOperation({
      target: config.badgeContractAddress,
      data: encodeFunctionData({
        abi: alchemyBadgesOperatorABI,
        functionName: "mintBadge",
        args: [BigInt(2), BigInt(1)],
      }),
    });
    return {
      nextStep: OnboardingStepIdentifier.CHECK_WALLET_AND_BADGES,
      addedContext: {
        mintDeployTxnHash: result!.hash as `0x${string}`,
      },
    };
  },
  /*
   * This step will polls for the smart contract wallet for as initial badge for
   * the smart account, with the paymaster middleware.
   */
  [OnboardingStepIdentifier.CHECK_WALLET_AND_BADGES]: async (context) => {
    const {mintDeployTxnHash} = context;
    await pollForLambdaForComplete(async () => {
      return context
        .passkeyProvider!.rpcClient.getUserOperationReceipt(mintDeployTxnHash!)
        .then((receipt) => {
          return receipt !== null;
        })
        .catch(() => {
          return false;
        });
    });
    return {
      nextStep: OnboardingStepIdentifier.UPDATE_MEMBER_ADDRESS,
      addedContext: {},
    };
  },
  /*
   * This step stores the newly generated account address on the member record.
   */
  [OnboardingStepIdentifier.UPDATE_MEMBER_ADDRESS]: async (context) => {
    const {accountAddress, credentialId} = context;
    const addressUpdateResponse = await updateMemberAddress(
      accountAddress!,
      credentialId!,
    );
    return {
      nextStep: OnboardingStepIdentifier.DONE,
      addedContext: {
        addressUpdateResponse,
      },
    };
  },
  /* DONE! --- No Op */
  [OnboardingStepIdentifier.DONE]: async () => {
    return {
      nextStep: OnboardingStepIdentifier.DONE,
      addedContext: {},
    };
  },
};

export function useOnboardingOrchestrator(member: Member) {
  // Setup initial data and state
  const config: OnboardingConfiguration = useMemo(() => {
    const client = createPublicErc4337Client({
      chain: CHAIN,
      rpcUrl: BUNDLER_URL,
    });
    return {
      badgeContractAddress: ALCHEMY_BADGE_OPERATOR_ADDRESS,
      simpleAccountFactoryAddress: PASSKEY_FACTORY_ADDRESS,
      gasManagerPolicyId: PAYMASTER_POLICY_ID,
      rpcUrl: BUNDLER_URL,
      chain: CHAIN,
      client: client,
    };
  }, []);
  const [currentStep, updateStep] = useState<OnboardingStep>(
    initialStep(member, CHAIN),
  );
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(
    () => updateStep(initialStep(member, CHAIN)),
    [member],
  );

  const go = useCallback(async () => {
    try {
      let inMemStep = currentStep;
      async function _updateStep(
        stepIdentifier: OnboardingStepIdentifier,
        context: Partial<OnboardingContext>,
      ) {
        const assembledContext = {
          ...inMemStep.context,
          ...context,
        };
        const meta = metaForStepIdentifier(stepIdentifier, context, CHAIN);
        const resolvedStep = {
          identifier: stepIdentifier,
          context: assembledContext,
          ...meta,
        };
        inMemStep = resolvedStep;
        updateStep(resolvedStep);
      }

      /*
       * This is the main onboarding loop. It will continue until the
       * identifier is set to DONE. Each step will update the inMemStep
       * variable, which will be used to update the currentStep state variable.
       *
       * If a step is fails, it will throw an error, which will be caught by the
       * try/catch block and the onboarding can be continued from the last successful
       * step.
       */
      while (inMemStep.identifier !== OnboardingStepIdentifier.DONE) {
        await onboardingStepHandlers[inMemStep.identifier](
          inMemStep.context,
          config,
        )
          .then((step) => _updateStep(step.nextStep, step.addedContext))
          .catch((e) => {
            console.error(e);
            throw e;
          });
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [config, currentStep, updateStep]);

  return {
    currentStep,
    updateStep,
    isLoading,
    go,
    reset,
  };
}
