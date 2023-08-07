import React from "react";
import {Button, Text, VStack} from "@chakra-ui/react";
import {useMutation} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {queryClient} from "../../clients/query";
import {useMe} from "../../context/me";
import {MultiActionProgressModal} from "../common/MultiActionProgressModal";
import {useLoginOrchestrator} from "../../clients/login";

export function LoginPage(props: React.PropsWithChildren<{}>) {
  const me = useMe();
  const navigate = useNavigate();

  const {go, currentStep, reset} = useLoginOrchestrator();
  const loginMutation = useMutation<
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
      <Text>Click below to login</Text>
      <Button
        isLoading={loginMutation.isLoading}
        onClick={() => {
          loginMutation.mutate();
          reset();
        }}
      >
        Login with this device
      </Button>
      {props.children}
      <MultiActionProgressModal
        multiActionMutation={loginMutation}
        currentStep={currentStep}
        onClose={() => {
          if (currentStep.percent === 100) navigate(`/profile/me`);
        }}
      />
    </VStack>
  );
}
