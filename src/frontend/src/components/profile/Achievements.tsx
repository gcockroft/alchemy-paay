import {memo} from "react";
import {Badge, EmptyBadge} from "../common/Badge";
import {useBadgeRequestsQuery, useMemberBadgesQuery} from "../../clients/nfts";
import {LoadingScreen} from "../../screens/LoadingScreen";
import {ErrorScreen} from "../../screens/ErrorScreen";
import {
  Box,
  BoxProps,
  Grid,
  HStack,
  Heading,
  Tag,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {Member} from "../../declarations/api";
import {RequestModal} from "../requests/RequestModal";
import {useMe} from "../../context/me";
import {AddIcon} from "@chakra-ui/icons";
import {Link} from "react-router-dom";
import Sparkles from "@chad.b.morrow/sparkles";

interface AchievementsProps extends BoxProps {
  member: Member;
}

const Achievements = memo(function Achievements({
  member,
  ...boxProps
}: AchievementsProps) {
  const me = useMe();
  const badgeRequestsQuery = useBadgeRequestsQuery(me);
  const ownedNFTsQuery = useMemberBadgesQuery(member);
  const disclosure = useDisclosure();
  const badgeRequests = badgeRequestsQuery.data?.requests?.filter(
    (r) => r.type === "personal-badge-mint",
  );
  const showBadgeRequests =
    member.id === me.id && (badgeRequests?.length ?? 0) > 0;
  if (!member.ethAddress) {
    return <Text size="sm">No Address to Assoicate Achievements</Text>;
  }

  if (
    ownedNFTsQuery.isLoading ||
    (ownedNFTsQuery.data && !ownedNFTsQuery.data.ownedNfts)
  ) {
    return <LoadingScreen />;
  }

  if (!ownedNFTsQuery.data || ownedNFTsQuery.isError) {
    return <ErrorScreen />;
  }

  const ownedNfts = ownedNFTsQuery.data.ownedNfts;
  // Add balances of each NFT to get total number of NFTs owned
  const totalNfts = ownedNfts.reduce((acc, nft) => acc + nft.balance, 0);
  return (
    <VStack>
      <HStack
        w="100%"
        alignItems="center"
        paddingBottom={2}
        justifyContent="space-between"
      >
        <HStack alignItems="center">
          <Heading size="md" margin={0} fontWeight="semibold" color="gray.500">
            Achievements
          </Heading>
          <Tag colorScheme="linkedin">{totalNfts} Badges</Tag>
        </HStack>
      </HStack>
      <Grid
        {...boxProps}
        templateColumns={[
          "repeat(2, 1fr)",
          "repeat(3, 1fr)",
          "repeat(5, 1fr)",
          "repeat(8, 1fr)",
          "repeat(5, 1fr)",
          "repeat(10, 1fr)",
        ]}
        gap={6}
        padding={3}
      >
        {ownedNfts.map((value, idx) => (
          <Badge nft={value} key={idx} balance={value.balance} />
        ))}
        {member.id !== me.id && (
          <Tooltip label={`Give ${member.firstName} a badge!`}>
            <Link to="/badges">
              <EmptyBadge
                cursor="pointer"
                border="dashed 3px gray"
                backgroundColor="clear"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <AddIcon fontSize="2xl" color="gray" />
              </EmptyBadge>
            </Link>
          </Tooltip>
        )}
        {showBadgeRequests && (
          <Box onClick={disclosure.onOpen}>
            <Tooltip
              label={`You have ${badgeRequests?.length} pending badges to approve!`}
            >
              <Box>
                <Sparkles
                  colors="rainbow"
                  variance={300}
                  rate={250}
                  minSize={30}
                  maxSize={40}
                  isToggleable={false}
                >
                  <EmptyBadge
                    cursor="pointer"
                    border="solid 1px lightgray"
                    backgroundColor="#f0f0f055"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Heading margin={0} fontSize="4xl" color="gray.500">
                      {badgeRequests?.length}
                    </Heading>
                  </EmptyBadge>
                </Sparkles>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Grid>
      {totalNfts === 0 && !showBadgeRequests && (
        <Text color="gray.500" size="sm">
          No Achievements for Address
        </Text>
      )}
      {showBadgeRequests && (
        <RequestModal requests={badgeRequests!} {...disclosure} isCentered />
      )}
    </VStack>
  );
});

export default Achievements;
