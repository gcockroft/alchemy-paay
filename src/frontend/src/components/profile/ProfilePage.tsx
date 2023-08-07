import {
  Box,
  BoxProps,
  Heading,
  HStack,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {memo, useCallback, useMemo} from "react";
import {Member} from "../../declarations/api";
import {AboutMe} from "./AboutMe";
import Achievements from "./Achievements";
import {AlchemistScroll} from "./AlchemistScroll";
import MemberBadgeWallet, {BadgeWalletLinks} from "./MemberBadgeWallet";
import {MemberProfile} from "./MemberProfile";

const ProfileAttribute = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <VStack alignItems="flex-start" gap={0}>
    <Heading
      size={["xs", "sm"]}
      fontWeight="semibold"
      color="gray.500"
      margin={0}
      w="100%"
      style={{
        whiteSpace: "nowrap",
        overflowX: "hidden",
        textOverflow: "ellipsis",
        display: "block",
      }}
    >
      {label}:
    </Heading>
    <Heading
      size={["xs", "sm"]}
      fontWeight="medium"
      color="gray.700"
      margin={0}
      w="100%"
      style={{
        whiteSpace: "nowrap",
        overflowX: "hidden",
        textOverflow: "ellipsis",
        display: "block",
      }}
    >
      {value}
    </Heading>
  </VStack>
);

const ProfileDetailCard = ({
  children,
  ...boxProps
}: React.PropsWithChildren<BoxProps>) => (
  <VStack
    w="100%"
    padding={10}
    alignItems="flex-start"
    boxShadow="0 4px 5px rgba(0, 0, 0, 0.1), 0 6px 5px rgba(0, 0, 0, 0.1)"
    borderRadius={10}
    border={"1px solid rgba(0, 0, 0, 0.05)"}
    {...boxProps}
  >
    {children}
  </VStack>
);

function UnMemoProfilePage({
  member,
  refetchMember,
}: {
  member: Member;
  refetchMember: () => void;
}) {
  const copyAddressTextToClipboard = useCallback(async () => {
    if ("clipboard" in navigator && member.ethAddress) {
      await navigator.clipboard.writeText(member.ethAddress);
      alert("Copied Address to Clipboard");
      return;
    }
  }, [member.ethAddress]);

  const {longerThanPercent, formattedStartDate} = useMemo(() => {
    let formattedStartDate = "";
    let duration = "";
    if (member.startDate) {
      const date = new Date(member.startDate);
      formattedStartDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });

      // Calculate the number of milliseconds between the random date and now
      const timeDiff = Date.now() - date.getTime();

      // Calculate the number of years between the random date and now
      const yearsDiff = timeDiff / (1000 * 60 * 60 * 24 * 365.25);

      // Check if the number of years is less than 1
      if (yearsDiff < 1) {
        // Calculate the number of months between the random date and now
        const monthsDiff = timeDiff / (1000 * 60 * 60 * 24 * 30.44);
        duration = `${Math.floor(monthsDiff)} months`;
      } else {
        duration = `${yearsDiff.toFixed(1)} years`;
      }
    }
    const percent = (
      (1 - (member.startedBefore + 1) / member.companyTotal) *
      100
    ).toFixed(1);

    const longerThanPercent = `${percent}% of the Company (${duration})`;

    return {
      longerThanPercent,
      formattedStartDate,
    };
  }, [member]);

  return (
    <HStack
      gap={[2, 5]}
      alignItems={["center", "center", "start"]}
      padding={[3, 5, 25]}
      flexDirection={["column", "column", "row"]}
    >
      <VStack gap={3}>
        <VStack
          gap={3}
          w={["100%", "100%", "300px"]}
          alignItems={["center", "center", "start"]}
          flexDirection={["row", "row", "column"]}
        >
          <MemberProfile member={member} size={["100px", "150px", "250px"]} />
          <VStack alignItems="flex-start">
            <Box>
              <Heading margin={0} size="lg" fontWeight="medium">
                {member.firstName} {member.lastName}
              </Heading>
              <Heading
                margin={0}
                size="sm"
                fontWeight="normal"
                color="gray.500"
              >
                @{member.displayName}
              </Heading>
              <Heading
                margin={0}
                size="sm"
                fontWeight="normal"
                color="gray.500"
              >
                {member.title}
              </Heading>
            </Box>
            <ProfileAttribute
              label="Longer Than"
              value={`${longerThanPercent}`}
            />
          </VStack>
        </VStack>
        <VStack
          display={["grid", "grid", "flex"]}
          gridTemplateColumns="repeat(2, minmax(0, 1fr))"
          gap={[1, 2]}
          w={["100%", "100%", "300px"]}
          alignItems="start"
        >
          {member.currentMemberId === member.id && (
            <Tooltip label="Click to Copy">
              <Box
                w="100%"
                cursor="pointer"
                onClick={copyAddressTextToClipboard}
              >
                <ProfileAttribute
                  label="Address"
                  value={member.ethAddress ?? "Not Set"}
                />
              </Box>
            </Tooltip>
          )}
          <ProfileAttribute label="Email" value={member.email} />
          {member.startDate && (
            <ProfileAttribute label="Start Date" value={formattedStartDate} />
          )}
          {member.tz && <ProfileAttribute label="Timezone" value={member.tz} />}
        </VStack>
      </VStack>
      <VStack
        flex={1}
        gap={5}
        padding={["0px", "0px", "10px"]}
        overflow="hidden"
        w={["100%", "100%", "calc(100% - 300px)"]}
      >
        <ProfileDetailCard padding="20px 0px">
          <Heading
            size="md"
            paddingLeft={10}
            fontWeight="semibold"
            color="gray.500"
          >
            Other Alchemists
          </Heading>
          <AlchemistScroll maxW="100%" />
        </ProfileDetailCard>
        <ProfileDetailCard>
          <Achievements
            w="100%"
            maxH="225px"
            overflow="scroll"
            member={member}
          />
        </ProfileDetailCard>
        <ProfileDetailCard>
          <Heading size="sm" margin={0} fontWeight="semibold" color="gray.500">
            About me
          </Heading>
          <AboutMe refetchMember={refetchMember} member={member} />
        </ProfileDetailCard>
        <ProfileDetailCard>
          <Heading size="sm" margin={0} fontWeight="semibold" color="gray.500">
            Recent Activity
          </Heading>
          <Heading size="md" h="500px">
            Coming Soon...
          </Heading>
        </ProfileDetailCard>
      </VStack>
      <Box
        w="526px"
        display={["none", "none", "none", "none", "block"]}
        padding="10px"
        position="relative"
      >
        <BadgeWalletLinks member={member} />
        <Box top="120px" right="25px" position="fixed">
          <MemberBadgeWallet member={member} />
        </Box>
      </Box>
    </HStack>
  );
}

export const ProfilePage = memo(UnMemoProfilePage);
