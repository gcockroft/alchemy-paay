import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import {useMe} from "../context/me";
import {MemberProfile} from "./profile/MemberProfile";
import {ReactComponent as Logo} from "../assets/faamLogo.svg";
import {RequestModal} from "./requests/RequestModal";
import {AppMemberStatus} from "../declarations/api";
import {useRequestsQuery} from "../clients/member";

export default function NavigationBar() {
  const me = useMe();
  const requestsQuery = useRequestsQuery(me);
  const disclosure = useDisclosure();
  const onboarded = me.status !== AppMemberStatus.UNONBOARDED;

  return (
    <Flex padding="20px" justifyContent="space-between" alignItems="center">
      <HStack gap={5} alignItems="center">
        <Link to="/">
          <Box
            height={["15px", "20px", "40px", "40px", "40px"]}
            width={["50px", "100px", "inherit", "inherit", "inherit"]}
          >
            <Logo width="100%" height="100%" />
          </Box>
        </Link>
        <Link to="/badges" hidden={!onboarded}>
          <Heading style={{margin: 0}} size={["xs", "xs", "md", "md", "md"]}>
            Badges
          </Heading>
        </Link>
        <Link to="/about" hidden={!onboarded}>
          <Heading style={{margin: 0}} size={["xs", "xs", "md", "md", "md"]}>
            About
          </Heading>
        </Link>
        <Link
          to="/admin"
          hidden={!onboarded || !me.permissions.includes("employee_admin")}
        >
          <Heading style={{margin: 0}} size={["xs", "xs", "md", "md", "md"]}>
            Admin
          </Heading>
        </Link>
      </HStack>
      <Box position="relative">
        <MemberProfile
          member={me}
          size={["35px", "35px", "50px", "50px", "50px"]}
        />
        {requestsQuery.data && requestsQuery.data.length > 0 && (
          <>
            <Button
              size="xs"
              position="absolute"
              bottom="-7px"
              left="-7px"
              borderRadius="50%"
              colorScheme="red"
              onClick={disclosure.onOpen}
            >
              {requestsQuery.data?.length}
            </Button>
            <RequestModal
              requests={requestsQuery.data ?? []}
              {...disclosure}
              isCentered
            />
          </>
        )}
      </Box>
    </Flex>
  );
}
