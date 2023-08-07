import {
  Box,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {EditIcon} from "@chakra-ui/icons";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import {useMe} from "../../context/me";
import {Member} from "../../declarations/api";
import {useCallback, useEffect, useState} from "react";
import Preview from "react-markdown-editor-lite/cjs/editor/preview";
import {useMutation} from "@tanstack/react-query";
import {updateMemberAboutMe} from "../../http/endpoints";
import "react-markdown-editor-lite/lib/index.css";
import {updateMemberQueries} from "../../clients/member";

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

export function AboutMe({
  member,
  refetchMember,
}: {
  member: Member;
  refetchMember: () => void;
}) {
  const {isOpen, onClose, onOpen} = useDisclosure();
  const [text, setText] = useState(member.aboutMeMd);
  const me = useMe();

  const aboutMeMutation = useMutation(
    ["member-about-me", member.id],
    (text: string) => {
      return updateMemberAboutMe(text);
    },
  );

  useEffect(() => {
    setText(member.aboutMeMd);
  }, [member.aboutMeMd]);

  const triggerUpdate = useCallback(() => {
    return aboutMeMutation
      .mutateAsync(text ?? "")
      .then(() => {
        updateMemberQueries({...member, aboutMeMd: text});
        refetchMember();
        onClose();
        return text;
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to update about me");
      });
  }, [text, aboutMeMutation, member, onClose, refetchMember]);

  return (
    <Box position="relative" minH="350px" w="100%">
      {!text && member.id === me.id && (
        <Text color="gray.500">
          Edit this section to add information about you!
        </Text>
      )}
      {!text && member.id !== me.id && (
        <Text color="gray.500">Nothing here right now...</Text>
      )}
      {text && <Preview html={mdParser.render(member.aboutMeMd ?? "")} />}
      {member.id === me.id && (
        <EditIcon
          position="absolute"
          top="-30px"
          right="20px"
          cursor="pointer"
          onClick={onOpen}
          aria-label={"edit"}
        />
      )}
      {member.id === me.id && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <VStack
            style={{
              padding: "20px",
              top: "0vh",
              left: "0vw",
              position: "absolute",
              height: "100vh",
              width: "100vw",
              zIndex: 9999,
            }}
          >
            <MdEditor
              defaultValue={text}
              style={{flex: 1, width: "100%", height: "100%"}}
              renderHTML={(text) => mdParser.render(text)}
              onChange={({text}) => {
                setText(text);
              }}
            />
            <HStack w="100%" justifyContent="flex-end">
              <Button variant="solid" colorScheme="gray" onClick={onClose}>
                Close
              </Button>
              <Button
                isLoading={aboutMeMutation.isLoading}
                variant="solid"
                colorScheme="blue"
                onClick={triggerUpdate}
              >
                Accept
              </Button>
            </HStack>
          </VStack>
        </Modal>
      )}
    </Box>
  );
}
