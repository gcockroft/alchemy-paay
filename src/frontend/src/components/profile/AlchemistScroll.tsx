import {
  Box,
  BoxProps,
  Button,
  Heading,
  HStack,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import {useMembersQuery} from "../../clients/member";
import {useState, useRef, useEffect} from "react";
import {MemberProfile} from "./MemberProfile";
import {ArrowRightIcon} from "@chakra-ui/icons";

export function AlchemistScroll(props: BoxProps) {
  const membersQuery = useMembersQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToRight, setHasScrolledToRight] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    function handleScroll() {
      if (!container) {
        return;
      }
      if (
        container.scrollLeft + container.clientWidth ===
        container.scrollWidth
      ) {
        setHasScrolledToRight(true);
      } else {
        setHasScrolledToRight(false);
      }
    }
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      membersQuery.hasNextPage &&
      hasScrolledToRight &&
      !membersQuery.isFetchingNextPage
    ) {
      membersQuery.fetchNextPage();
    }
  }, [hasScrolledToRight, membersQuery]);

  return (
    <HStack
      ref={containerRef}
      spacing="4"
      overflowX="auto"
      paddingBottom={4}
      {...props}
    >
      <Box>
        <Box w={5} h="100%" />
      </Box>
      {membersQuery.members.map((m) => (
        <VStack key={m.id} alignItems="center" minW="50px" margin={0}>
          <MemberProfile key={m.id} member={m} size="50px" shadow="none" />
          <Heading fontWeight="normal" size="xs">
            {m.firstName}
          </Heading>
        </VStack>
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
      {!membersQuery.isFetchingNextPage &&
        membersQuery.hasNextPage &&
        membersQuery.members.length > 0 && (
          <VStack
            justifyContent="center"
            alignItems="center"
            minW="50px"
            minH="50px"
          >
            <Button
              size="xs"
              color="gray.500"
              width="50px"
              height="50px"
              borderRadius="50%"
              onClick={() => {
                membersQuery.fetchNextPage();
              }}
            >
              <ArrowRightIcon />
            </Button>
            <Heading fontWeight="normal" size="xs">
              Load more...
            </Heading>
          </VStack>
        )}
      <Box>
        <Box w={5} h="100%" />
      </Box>
    </HStack>
  );
}
