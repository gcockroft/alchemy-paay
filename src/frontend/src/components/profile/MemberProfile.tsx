import {Box, BoxProps, Image, Spinner} from "@chakra-ui/react";
import {Member} from "../../declarations/api";
import {useCallback, useState} from "react";
import {Link} from "react-router-dom";

export function MemberProfile({
  member,
  size,
  shadow,
}: {
  member: Member;
  size?: BoxProps["width"];
  shadow?: string;
}) {
  const dim = size ?? "60px";
  const [loading, setLoading] = useState(true);
  const [spinner, setSpinner] = useState(true);
  const loaded = useCallback(() => {
    setTimeout(() => setSpinner(false), 1000);
    setTimeout(() => setLoading(false), 300);
  }, [setLoading, setSpinner]);
  return (
    <Link to={`/profile/${member.id}`}>
      <Box
        position="relative"
        boxShadow={
          shadow ??
          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
        }
        borderRadius={"50%"}
      >
        <Image
          width={dim}
          height={dim}
          alt="profile"
          src={member.imageUrl}
          onLoad={loaded}
          loading="lazy"
          borderRadius={"50%"}
          opacity={loading ? 0 : 1}
          transition=".3s ease-in"
        />
        {spinner && (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            width="100%"
            height="100%"
            opacity={loading ? 1 : 0}
            position="absolute"
            top="0"
            transition=".3s ease-out"
          />
        )}
      </Box>
    </Link>
  );
}
