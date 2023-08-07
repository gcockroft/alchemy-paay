import {useCallback} from "react";
import {BadgeMintRequest, Request} from "../../declarations/api";
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import {
  useBadgeAcceptMutation,
  useMutateRequestStatus,
} from "../../clients/nfts";
import {useMe} from "../../context/me";
import {RequestCard} from "./RequestCard";

export function BadgeRequestCard({request}: {request: Request}) {
  const badgeRequest = JSON.parse(request.jsonDataContext) as BadgeMintRequest;
  const acceptMutation = useBadgeAcceptMutation(badgeRequest);
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
        title={badgeRequest.title}
        w="100%"
      >
        {badgeRequest.title}
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
        title={badgeRequest.description}
        w="100%"
      >
        {badgeRequest.description}
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
        <Image
          justifyContent={"start"}
          src={badgeRequest.image ?? undefined}
          minH="150px"
          minW="150px"
          maxH="150px"
          maxW="150px"
          objectFit="cover"
          borderRadius="md"
          backgroundColor="gray.300"
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
            title={badgeRequest.description}
            w="100%"
          >
            <b>{request.sender}</b>
          </Text>
          <Text fontSize="xs">{badgeRequest.requestDescription}</Text>
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
