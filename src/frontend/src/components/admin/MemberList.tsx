import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {useAdminMembersQuery} from "../../clients/admin";
import {ChevronRightIcon, InfoIcon} from "@chakra-ui/icons";

export function MemberList() {
  const membersQuery = useAdminMembersQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    function handleScroll() {
      if (!container) {
        return;
      }
      if (
        container.scrollTop + container.clientHeight ===
        container.scrollHeight
      ) {
        setHasScrolledToBottom(true);
      } else {
        setHasScrolledToBottom(false);
      }
    }
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      membersQuery.hasNextPage &&
      hasScrolledToBottom &&
      !membersQuery.isFetchingNextPage
    ) {
      membersQuery.fetchNextPage();
    }
  }, [hasScrolledToBottom, membersQuery]);

  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        padding="0"
      >
        <BreadcrumbItem>
          <Link to="/admin">Admin</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Link to="/admin/members">Members</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      <VStack
        ref={containerRef}
        alignItems="flex-start"
        spacing="4"
        overflowY="auto"
        paddingLeft="2rem"
        paddingRight="2rem"
      >
        <Flex w="100%" justifyContent="space-between">
          <Heading display="flex" alignItems="center" gap="5px">
            <InfoIcon />
            Members
          </Heading>
          <Link to="/admin/member/create">
            <Button colorScheme="blue">Create Member</Button>
          </Link>
        </Flex>
        <Divider variant="dashed" color="gray.200" />
        {membersQuery.members.map((m) => (
          <Link style={{width: "100%"}} to={`/admin/member/${m.id}`} key={m.id}>
            <HStack
              spacing="4"
              boxShadow="0 4px 5px rgba(0, 0, 0, 0.1), 0 6px 5px rgba(0, 0, 0, 0.1)"
              w="100%"
              padding="5px"
              borderRadius={10}
              border=".5px solid #e2e8f0"
              transition={
                "box-shadow 0.2s ease-in-out; background-color 0.2s ease-in-out"
              }
              _hover={{
                boxShadow:
                  "0 4px 5px rgba(0, 0, 0, 0.3), 0 6px 5px rgba(0, 0, 0, 0.3)",
                backgroundColor: "#FCFCFC",
              }}
              cursor={"pointer"}
            >
              <Avatar name={m.email} />
              <VStack
                key={m.id}
                minW="50px"
                margin={0}
                alignItems="flex-start"
                gap={0}
              >
                <Heading fontWeight="normal" size="md" margin={0}>
                  {m.email}
                </Heading>
                <Text color="dark-gray" margin={0}>
                  id: {m.id} ({m.memberStatus})
                </Text>
              </VStack>
            </HStack>
          </Link>
        ))}
        {(membersQuery.isFetchingNextPage ||
          membersQuery.members.length === 0) && (
          <VStack
            justifyContent="center"
            alignItems="center"
            minW="50px"
            minH="50px"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              width="50px"
              height="50px"
              transition=".3s ease-out"
            />
            <Heading fontWeight="normal" size="xs">
              Loading
            </Heading>
          </VStack>
        )}
        <Box>
          <Box w={5} h="100%" />
        </Box>
      </VStack>
    </>
  );
}
