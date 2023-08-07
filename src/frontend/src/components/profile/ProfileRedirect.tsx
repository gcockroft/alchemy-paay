import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Flex, Spinner} from "@chakra-ui/react";
import {useMe} from "../../context/me";

export default function ProfileRedirect() {
  const navigate = useNavigate();
  const me = useMe();
  useEffect(() => {
    const slug = me.slug;
    if (slug) {
      navigate(`/profile/${slug}`);
    }
  }, [navigate, me.slug]);

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Flex>
  );
}
