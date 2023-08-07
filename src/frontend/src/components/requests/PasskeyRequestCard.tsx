import {useCallback} from "react";
import {AddPasskeyRequest, Request} from "../../declarations/api";
import {Box, Button, Divider, HStack, Heading, Text} from "@chakra-ui/react";
import {useMutateRequestStatus} from "../../clients/nfts";
import {useMe} from "../../context/me";
import {RequestCard} from "./RequestCard";
import {LockIcon} from "@chakra-ui/icons";
import {usePasskeyAcceptMutation} from "../../clients/member";

export function PasskeyRequestCard({request}: {request: Request}) {
  const passkeyRequest = JSON.parse(
    request.jsonDataContext,
  ) as AddPasskeyRequest;
  const acceptMutation = usePasskeyAcceptMutation(passkeyRequest);
  const me = useMe();
  const completionMutation = useMutateRequestStatus(me);
  const accept = useCallback(async () => {
    await acceptMutation.mutateAsync();
    await completionMutation.mutateAsync({id: request.id, status: "completed"});
  }, [acceptMutation, completionMutation, request.id]);
  const reject = useCallback(
    () => completionMutation.mutate({id: request.id, status: "rejected"}),
    [completionMutation, request.id],
  );
  const isLoading = acceptMutation.isLoading || completionMutation.isLoading;
  const date = new Date(request.dateCreated);
  return (
    <RequestCard>
      <Heading
        size="sm"
        margin={0}
        style={{
          whiteSpace: "nowrap",
          overflowX: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
        title="Add a new Passkey"
        w="100%"
      >
        Add a new Passkey
      </Heading>
      <Text
        style={{
          whiteSpace: "nowrap",
          overflowX: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
        color="GrayText"
        fontSize="xs"
        margin={0}
        title={passkeyRequest.device}
        w="100%"
      >
        {passkeyRequest.device}
      </Text>
      <Text
        style={{
          whiteSpace: "nowrap",
          overflowX: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
        color="GrayText"
        fontSize="xs"
        margin={0}
        w="100%"
      >
        on {date.toLocaleDateString()}
      </Text>
      <Divider margin={0} color={"lightgray"} />
      <Box position="relative">
        <LockIcon
          justifyContent={"start"}
          minH="150px"
          minW="150px"
          maxH="150px"
          maxW="150px"
          objectFit="cover"
          borderRadius="md"
          backgroundColor="gray.300"
          padding={2}
        />
        <Box
          margin={0}
          padding={2}
          style={{
            overflowY: "scroll",
          }}
          w="100%"
          h="100%"
          position="absolute"
          top={0}
          left={0}
          opacity="0"
          _hover={{
            opacity: "1",
          }}
          transition="opacity 0.2s ease-in-out"
          borderRadius="md"
          color="white"
          background="rgba(0,0,0,0.8)"
        >
          <Text
            style={{
              whiteSpace: "nowrap",
              overflowX: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
            fontSize="xs"
            margin={0}
            title={passkeyRequest.device}
            w="100%"
          >
            <b>{request.sender}</b>
          </Text>
          <Text fontSize="xs">
            <b>From Device:</b>
            <br />
            {passkeyRequest.device}
          </Text>
        </Box>
      </Box>
      <HStack justifySelf="end" paddingBottom={1}>
        <Button
          isLoading={isLoading}
          colorScheme="blue"
          onClick={accept}
          size={"sm"}
        >
          Accept
        </Button>
        <Button
          isLoading={isLoading}
          colorScheme="red"
          onClick={reject}
          size={"sm"}
        >
          Reject
        </Button>
      </HStack>
    </RequestCard>
  );
}
