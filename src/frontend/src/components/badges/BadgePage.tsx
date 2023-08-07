import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Text,
  VStack,
  HStack,
  Textarea,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import {Link, useParams} from "react-router-dom";
import {CheckCircleIcon, ChevronRightIcon, StarIcon} from "@chakra-ui/icons";
import MemberDropdown from "../member/MemberDropdown";
import {useBadgeQuery} from "../../clients/badges";
import {LoadingScreen} from "../../screens/LoadingScreen";
import {Badge} from "../common/Badge";
import {Member} from "../../declarations/api";
import {useCallback, useState} from "react";
import {useMe} from "../../context/me";
import {useCreateBadgeRequest} from "../../clients/nfts";

function SuccessModal(props: {isOpen: boolean; onClose: () => void}) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sucessfully Sent Request</ModalHeader>
        <ModalCloseButton />

        <ModalBody marginBottom={5}>
          <VStack spacing="4" alignItems="center">
            <CheckCircleIcon color="green.500" w={12} h={12} />
            <Text style={{marginBottom: 0}}>
              We notified them with an email too!
            </Text>
            <Text style={{margin: 0, textDecoration: "underline"}}>
              <Link to="/profile/me">
                Click here to go back to your profile.
              </Link>
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function BadgePage() {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const me = useMe();
  const {id} = useParams();
  const badgeQuery = useBadgeQuery(parseInt(id ?? "-1"));
  const [selectedMember, setSelectedMember] = useState<Member>();
  const clearMember = useCallback(() => {
    setSelectedMember(undefined);
  }, []);
  const [requestDescription, setRequestDescription] = useState<string>();
  const mutation = useCreateBadgeRequest(me, () => {
    onOpen();
  });
  const closeModal = useCallback(() => {
    onClose();
    setRequestDescription(undefined);
    setSelectedMember(undefined);
  }, [onClose]);
  const send = useCallback(() => {
    mutation.mutate({
      badge: badgeQuery.data!,
      description: requestDescription!,
      reciever: selectedMember!,
    });
  }, [badgeQuery.data, requestDescription, selectedMember, mutation]);
  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        padding="0"
      >
        <BreadcrumbItem>
          <Link to="/badges">Badges</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/badges/${id}`}>{id}</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      {badgeQuery.isLoading ? (
        <LoadingScreen />
      ) : (
        <VStack
          alignItems="flex-start"
          spacing="4"
          overflowY="auto"
          paddingLeft={["1rem", "1rem", "4rem", "8rem", "8rem"]}
          paddingRight={["1rem", "1rem", "4rem", "8rem", "8rem"]}
          paddingTop="2rem"
        >
          <HStack w="100%" gap={8} alignItems="top">
            <Badge nft={badgeQuery.data!} size="200px" />
            <Box flex="1">
              <Heading display="flex" alignItems="center" gap="5px">
                Send {badgeQuery.data?.title}!
              </Heading>
              <Text color="gray.500" style={{margin: 0}}>
                {badgeQuery.data?.description &&
                badgeQuery.data?.description !== ""
                  ? badgeQuery.data?.description
                  : "Call out an applishment and send this badge to a fellow Alchemist!"}
              </Text>
            </Box>
          </HStack>
          <Divider variant="dashed" color="gray.200" />
          <FormControl id="member-dropdown">
            <FormLabel>Send to</FormLabel>
            <MemberDropdown
              selectedMember={selectedMember}
              didSelectClearMember={clearMember}
              didSelectMember={setSelectedMember}
            />
            <br />
            {selectedMember && (
              <>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="What did they do to earn this badge?"
                  value={requestDescription}
                  onChange={(e) => {
                    setRequestDescription(e.target.value);
                  }}
                />
              </>
            )}
          </FormControl>
          {selectedMember && (
            <Button
              colorScheme="blue"
              type="submit"
              display="flex"
              gap={1}
              isLoading={mutation.isLoading}
              isDisabled={
                !selectedMember ||
                !requestDescription ||
                requestDescription === ""
              }
              onClick={send}
            >
              <StarIcon />
              Send
            </Button>
          )}
          {mutation.isError && (
            <Text color="red.500">Error: {`${mutation.error}`}</Text>
          )}
        </VStack>
      )}
      <SuccessModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
}
