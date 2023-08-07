import {Member} from "../../declarations/api";
import {ReactComponent as WalletFront} from "../../assets/walletFront.svg";
import {ReactComponent as WalletBack} from "../../assets/walletBack.svg";
import {MemberBadge} from "./MemberBadge";
import {memo, useCallback, useEffect, useMemo, useState} from "react";
import {ReactComponent as OpenSea} from "../../assets/opensea.svg";
import {ReactComponent as Polyscan} from "../../assets/polyscan.svg";
import {useFaamBadgeQuery} from "../../clients/nfts";
import {Box, Center, HStack, Heading, Spinner, Text} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import {OPEN_SEA_ROUTE, POLYSCAN_ROUTE} from "../../constants";

enum BadgeControlState {
  MISSING,
  VALID,
  LOADING,
  ERROR,
}

const BADGE_TOP_MARGIN = 27;
const BADGE_PEAK = 205;
const BADGE_SETTLE = 65;
const BADGE_VALLEY = 475;

const ScrollingBadgeWalletCard = memo(function BadgeWalletCard({
  member,
}: {
  member: Member;
}) {
  const [offset, setOffset] = useState(0);
  const faamBadgeQuery = useFaamBadgeQuery(member);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const badgeTop = useCallback((offset: number) => {
    const FACTOR =
      BADGE_VALLEY /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
    const relOff = offset * FACTOR;
    if (relOff <= BADGE_PEAK) {
      return -relOff; // y = x
    } else if (relOff <= BADGE_VALLEY) {
      return relOff - 2 * BADGE_PEAK;
    } else {
      return BADGE_SETTLE;
    }
  }, []);

  const cardIndex = useCallback((offset: number) => {
    const FACTOR =
      BADGE_VALLEY /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
    const relOff = offset * FACTOR;
    if (relOff >= BADGE_PEAK) {
      return 0;
    }
    return 1;
  }, []);

  const badgeTopVal = badgeTop(offset);
  const cardIndexVal = cardIndex(offset);

  const onBadgeClick = useCallback(() => {
    if (faamBadgeQuery.data) {
      window.open(
        `${POLYSCAN_ROUTE}/address/${member.ethAddress}#tokentxnsErc1155`,
        "_blank",
      );
    }
  }, [faamBadgeQuery.data, member.ethAddress]);

  return (
    <Box
      position={"absolute"}
      left="15px"
      marginTop={`${BADGE_TOP_MARGIN}px`}
      top={`${badgeTopVal}px`}
      zIndex={cardIndexVal}
      opacity={faamBadgeQuery.data ? 1 : 0}
      // transition opacity and transform scale
      transition="opacity .3s ease-in"
      cursor={faamBadgeQuery.data ? "pointer" : "default"}
      onClick={onBadgeClick}
    >
      <MemberBadge
        member={faamBadgeQuery.data ? member : undefined}
        shouldTilt={offset === 0}
      />
    </Box>
  );
});

export const BadgeWalletLinks = memo(({member}: {member: Member}) => {
  const faamBadgeQuery = useFaamBadgeQuery(member);
  return (
    <Box
      position="absolute"
      top="425px"
      left="0px"
      width="100%"
      opacity={faamBadgeQuery.data ? 1 : 0}
      transition=".3s ease-in"
      pointerEvents={faamBadgeQuery.data ? undefined : "none"}
    >
      <Heading size="md" color="gray" marginTop={1}>
        View on
      </Heading>
      <HStack
        gap={4}
        alignItems="center"
        justifyContent="center"
        background="black"
        marginTop={1}
        borderRadius={15}
      >
        <Link
          target="_blank"
          rel="noopener noreferrer"
          to={`${OPEN_SEA_ROUTE}/${
            faamBadgeQuery.data?.contract.address
          }/${Number(faamBadgeQuery.data?.tokenId)}`}
        >
          <OpenSea />
        </Link>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          to={`${POLYSCAN_ROUTE}/address/${faamBadgeQuery.data?.contract.address}`}
        >
          <Polyscan height={50} width={200} />
        </Link>
      </HStack>
    </Box>
  );
});

const BadgeWalletMessaging = memo(({member}: {member: Member}) => {
  const faamBadgeQuery = useFaamBadgeQuery(member);
  const controlState: BadgeControlState = useMemo(() => {
    if (faamBadgeQuery.isLoading) {
      return BadgeControlState.LOADING;
    } else if (faamBadgeQuery.error) {
      return BadgeControlState.ERROR;
    } else {
      return faamBadgeQuery.data
        ? BadgeControlState.VALID
        : BadgeControlState.MISSING;
    }
  }, [faamBadgeQuery.data, faamBadgeQuery.error, faamBadgeQuery.isLoading]);

  return (
    <Center
      width="100%"
      height="100%"
      backgroundColor={`rgba(0,0,0,${
        controlState === BadgeControlState.VALID ? 0 : 0.5
      })`}
      borderRadius="0px 0px 20px 20px"
      padding="5px"
      color="white"
      position="absolute"
      top="0px"
      textAlign="center"
      transition=".3s ease-in"
    >
      {controlState === BadgeControlState.MISSING && (
        <Box>
          <Heading size="lg" className="brandText">
            A badge was not found for
            <br />
            {member.email}
          </Heading>
          <Text>Contact an admin to mint member badges</Text>
        </Box>
      )}
      {controlState === BadgeControlState.LOADING && (
        <Spinner
          size="xl"
          thickness="5px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.800"
        />
      )}
      {controlState === BadgeControlState.ERROR && (
        <Box>
          <Heading size="lg">There was an error loading the badge.</Heading>
          <Text>Please try refreshing the page.</Text>
        </Box>
      )}
    </Center>
  );
});

const MemberBadgeWallet = memo(function BadgeWallet({
  member,
}: {
  member: Member;
}) {
  return (
    <Box color="white" position="relative">
      <WalletBack />
      <ScrollingBadgeWalletCard member={member} />
      <WalletFront style={{position: "absolute", left: 0, top: 138}} />
      <BadgeWalletMessaging member={member} />
    </Box>
  );
});

export default MemberBadgeWallet;
