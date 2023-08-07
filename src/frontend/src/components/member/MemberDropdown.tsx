import {useCallback, useMemo, useState} from "react";
import {
  Box,
  Avatar,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Heading,
  BoxProps,
  Tooltip,
} from "@chakra-ui/react";
import {Member} from "../../declarations/api";
import {getMembers} from "../../http/endpoints";
import {CloseIcon} from "@chakra-ui/icons";
import debounce from "lodash";
import {useMe} from "../../context/me";

const MemberRow = ({
  member,
  onClick,
  children,
  ...props
}: BoxProps & {member: Member}) => {
  return (
    <HStack {...props}>
      <HStack flex="1" onClick={onClick}>
        <Avatar src={member.imageUrl} size="sm" marginRight={2} />
        <VStack alignItems="start" gap={0}>
          <Heading size="sm" style={{margin: 0}}>
            {member.firstName} {member.lastName}
          </Heading>
          <Text style={{margin: 0}}>{member.email}</Text>
        </VStack>
      </HStack>
      {children}
    </HStack>
  );
};

const MemberDropdown = ({
  selectedMember,
  didSelectMember,
  didSelectClearMember,
}: {
  selectedMember?: Member;
  didSelectMember: (member: Member) => void;
  didSelectClearMember: () => void;
}) => {
  const me = useMe();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMembers, setSearchMembers] = useState<Member[]>();

  const debouncedSave = useMemo(
    () =>
      debounce.debounce(async (newValue: string) => {
        setLoading(true);
        try {
          if (!newValue || newValue === "") return setSearchMembers(undefined);
          // Perform API call with the search term to fetch members
          const response = await getMembers(undefined, newValue.toLowerCase());
          setSearchMembers(response.members);
        } catch (error) {
          console.error("Error fetching members:", error);
        } finally {
          setLoading(false);
        }
      }),
    [],
  );

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
    debouncedSave(event.target.value);
  };

  const handleSelection = useCallback(
    (id: number) => {
      return () => {
        const member = searchMembers?.find((m) => m.id === id);
        didSelectMember(member!);
      };
    },
    [searchMembers, didSelectMember],
  );

  return (
    <Box>
      {!selectedMember && (
        <InputGroup>
          <Input
            type="text"
            placeholder="Search member"
            disabled={selectedMember !== undefined}
            value={searchTerm}
            onChange={handleInputChange}
            autoFocus={true}
          />
          <InputRightElement>
            {loading && <Spinner color="blue.500" />}
          </InputRightElement>
        </InputGroup>
      )}

      <VStack gap={0}>
        {!selectedMember &&
          searchMembers
            ?.filter((m) => m.id !== me.id)
            .map((member) => (
              <MemberRow
                member={member}
                style={{margin: 0}}
                key={member.id}
                onClick={handleSelection(member.id)}
                margin={0}
                w="100%"
                padding="5px 10px"
                border=".5px solid"
                borderColor="gray.300"
                transition={"background-color 0.2s ease-in-out"}
                _hover={{
                  backgroundColor: "gray.200",
                }}
                cursor={"pointer"}
              />
            ))}
        {searchMembers && searchMembers.length === 0 && !loading && (
          <Box
            style={{margin: 0}}
            margin={0}
            w="100%"
            padding={2}
            border=".5px solid"
            borderColor="gray.300"
          >
            <Heading size="sm" style={{margin: 0}}>
              No members found
            </Heading>
          </Box>
        )}
      </VStack>

      {selectedMember && (
        <MemberRow
          member={selectedMember}
          style={{margin: 0}}
          margin={0}
          w="100%"
          padding="5px 10px"
          border=".5px solid"
          borderColor="gray.300"
          transition={"background-color 0.2s ease-in-out"}
          _hover={{
            backgroundColor: "gray.200",
          }}
          cursor={"pointer"}
        >
          <Box
            onClick={didSelectClearMember}
            cursor={"pointer"}
            color="white"
            transition={"background-color 0.2s ease-in-out"}
          >
            <Tooltip label="Click to remove">
              <CloseIcon color="gray.600" />
            </Tooltip>
          </Box>
        </MemberRow>
      )}
    </Box>
  );
};

export default MemberDropdown;
