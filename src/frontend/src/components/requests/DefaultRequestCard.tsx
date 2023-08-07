import {Button, HStack, Heading, Image, Text} from "@chakra-ui/react";
import {useMe} from "../../context/me";
import {useMutateRequestStatus} from "../../clients/nfts";
import {useCallback} from "react";
import {Request} from "../../declarations/api";
import {RequestCard} from "./RequestCard";

const Actions = ({request}: {request: Request}) => {
  const me = useMe();
  const mutation = useMutateRequestStatus(me);

  const reject = useCallback(
    () => mutation.mutate({id: request.id, status: "rejected"}),
    [mutation, request.id],
  );

  const accept = useCallback(
    () => mutation.mutate({id: request.id, status: "completed"}),
    [mutation, request.id],
  );
  return (
    <HStack>
      <Button
        isLoading={mutation.isLoading}
        colorScheme="blue"
        onClick={accept}
      >
        Accept
      </Button>
      <Button isLoading={mutation.isLoading} colorScheme="red" onClick={reject}>
        Reject
      </Button>
    </HStack>
  );
};

export function DefaultRequestCard({request}: {request: Request}) {
  const date = new Date(request.dateCreated);
  return (
    <RequestCard explinationText={`${request.type} ID: ${request.id}`}>
      <Heading size="sm" margin={0}>
        {request.type}
      </Heading>
      <Image
        justifyContent={"start"}
        src={undefined}
        minH="150px"
        minW="150px"
        maxH="150px"
        maxW="150px"
        objectFit="cover"
        borderRadius="md"
        backgroundColor="gray.300"
      />
      <Text color="GrayText" fontSize="xs" margin={0}>
        {date.toLocaleDateString()}
      </Text>
      <Actions request={request} />
    </RequestCard>
  );
}
