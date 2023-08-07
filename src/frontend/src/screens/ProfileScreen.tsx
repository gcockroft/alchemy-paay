import {memo, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useMemberQuery} from "../clients/member";
import {ProfilePage} from "../components/profile/ProfilePage";
import {ErrorScreen} from "./ErrorScreen";
import {LoadingScreen} from "./LoadingScreen";
import {OnboardingPage} from "../components/onboarding/OnboardingPage";
import {Box, Center, Spinner} from "@chakra-ui/react";
import {AppMemberStatus, Member} from "../declarations/api";
import {UseQueryResult} from "@tanstack/react-query";
import {useMe} from "../context/me";
import {LoginPage} from "../components/login/LoginPage";

const ProflilePartial = memo(function ProfilePartial({
  memberQuery,
  shownMember,
}: {
  memberQuery: UseQueryResult<Member, unknown>;
  shownMember: Member;
}) {
  return (
    <Box>
      <ProfilePage refetchMember={memberQuery.refetch} member={shownMember} />
      <Center
        position="fixed"
        opacity={memberQuery.isLoading ? 1 : 0}
        backdropFilter={memberQuery.isLoading ? "blur(.3rem)" : "none"}
        w="100vw"
        h="100vh"
        transition="filter .3 ease-in; opacity .3s ease-in"
        pointerEvents={memberQuery.isLoading ? "all" : "none"}
        zIndex={1}
        top={0}
      >
        <Spinner
          size="xl"
          thickness="5px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.800"
        />
      </Center>
    </Box>
  );
});

export default function ProfileScreen() {
  const navigate = useNavigate();
  const memberQuery = useMemberQuery();
  const [mem, setMem] = useState<Member>();
  const me = useMe();

  useEffect(() => {
    if (memberQuery.error) {
      // Invalid slug, redirect to profile home.
      navigate("/profile");
    }
    if (memberQuery.data) {
      setMem(memberQuery.data);
    }
  }, [navigate, memberQuery.error, memberQuery.data]);

  if (memberQuery.isError) {
    return <ErrorScreen error="Member not found" />;
  }

  if (!mem) {
    return <LoadingScreen />;
  }

  // Show onboarding if is current user
  if (me.id === mem.id) {
    switch (me.status) {
      case AppMemberStatus.LOGGED_IN:
        return <ProflilePartial memberQuery={memberQuery} shownMember={mem} />;
      case AppMemberStatus.LOGGED_OUT:
        return <LoginPage />;
      case AppMemberStatus.UNONBOARDED:
        return <OnboardingPage />;
      default:
        throw new Error("Invalid member status");
    }
  } else {
    return <ProflilePartial memberQuery={memberQuery} shownMember={mem} />;
  }
}
