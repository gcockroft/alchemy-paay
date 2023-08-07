import React from "react";
import {Button, Text, VStack} from "@chakra-ui/react";
import {useMutation} from "@tanstack/react-query";
import {useOnboardingOrchestrator} from "../../clients/onboarding/controller";
import {queryClient} from "../../clients/query";
import {useMe} from "../../context/me";
import {MultiActionProgressModal} from "../common/MultiActionProgressModal";

export function OnboardingPage(props: React.PropsWithChildren<{}>) {
  const me = useMe();
  const {go, reset, currentStep} = useOnboardingOrchestrator(me);

  const memberOnboardingMutation = useMutation<
    void,
    {
      cause: {
        code: number;
        message: string;
      };
      metaMessages: string[];
    },
    void,
    unknown
  >(go, {
    onSuccess: () => {
      queryClient.invalidateQueries(["member", "me"]);
    },
  });

  return (
    <VStack
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <h1>Welcome {me.firstName}!</h1>
      <Text>Click below to get started</Text>
      <Button
        isLoading={memberOnboardingMutation.isLoading}
        onClick={() => {
          reset();
          memberOnboardingMutation.mutate();
        }}
      >
        Setup Your Wallet
      </Button>
      {props.children}
      <MultiActionProgressModal
        multiActionMutation={memberOnboardingMutation}
        currentStep={currentStep}
        onClose={() => {
          if (currentStep.percent === 100) window.location.reload();
        }}
      />
    </VStack>
  );
}
