import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import {useBadgesQuery} from "../../clients/badges";
import {ChevronRightIcon, StarIcon} from "@chakra-ui/icons";

export function BadgesList() {
  const badgesQuery = useBadgesQuery();
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
      </Breadcrumb>
      <Flex
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        padding={6}
      >
        <Box>
          <Heading display="flex" alignItems="center" gap="5px">
            <StarIcon />
            Badges
          </Heading>
          <Text color="gray.500" style={{margin: 0}}>
            Select a badge to give to a team member, or create a new badge.
          </Text>
        </Box>
        <Link to="/badges/create">
          <Button colorScheme="blue">Create Badge</Button>
        </Link>
      </Flex>
      <Divider variant="dashed" color="gray.200" />
      <Grid
        templateColumns={[
          `repeat(1, 1fr)`,
          `repeat(2, 1fr)`,
          `repeat(3, 1fr)`,
          `repeat(4, 1fr)`,
          `repeat(5, 1fr)`,
          `repeat(6, 1fr)`,
          `repeat(8, 1fr)`,
        ]}
        gap={6}
        padding={6}
        autoRows={"1fr"}
      >
        {badgesQuery.data
          // filter out main badge
          ?.filter((n) => parseInt(n.tokenId) !== 1)
          .map((b) => (
            <Link
              style={{width: "100%"}}
              to={`/badges/${b.tokenId}`}
              key={b.tokenId}
            >
              <Box
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
                <Heading
                  size="md"
                  margin={0}
                  style={{
                    whiteSpace: "nowrap",
                    overflowX: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                  title={b.title}
                  w="100%"
                >
                  {b.title}
                </Heading>
                <Text
                  style={{
                    whiteSpace: "nowrap",
                    overflowX: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                  color="GrayText"
                  fontSize="sm"
                  margin={0}
                  title={b.tokenId}
                  w="100%"
                >
                  Badge ID: {b.tokenId}
                </Text>
                <Divider margin={0} color={"lightgray"} />
                <Box position="relative">
                  <Image
                    justifyContent={"start"}
                    src={b.media[0]?.gateway ?? b.media[0]?.raw}
                    minH="150px"
                    minW="100%"
                    maxH="150px"
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
                    <Text fontSize="sm">{b.description}</Text>
                  </Box>
                </Box>
              </Box>
            </Link>
          ))}
      </Grid>
      {badgesQuery.isFetching && (
        <VStack
          justifyContent="center"
          alignItems="center"
          minW="100%"
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
        </VStack>
      )}
      {badgesQuery.isError && (
        <VStack
          justifyContent="center"
          alignItems="center"
          minW="100%"
          minH="50px"
        >
          <Heading fontWeight="normal" size="xs" colorScheme="red">
            {`${badgesQuery.error}`}
          </Heading>
        </VStack>
      )}
    </>
  );
}
