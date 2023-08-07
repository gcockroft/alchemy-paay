import {
  Box,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
} from "@chakra-ui/react";
import {Request} from "../../declarations/api";
import {BadgeRequestCard} from "./BadgeRequestCard";
import {DefaultRequestCard} from "./DefaultRequestCard";
import {PasskeyRequestCard} from "./PasskeyRequestCard";

export function RequestModal(
  props: Omit<ModalProps, "children"> & {
    requests: Request[];
  },
) {
  const count = props.requests.length;
  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent maxH="80%" maxW="80%" minW="300px" minH="375px" w="none">
        <ModalHeader>Requests</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          overflow="scroll"
          display={["block", "flex"]}
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            templateColumns={[
              `repeat(${Math.min(1, count)}, 1fr)`,
              `repeat(${Math.min(2, count)}, 1fr)`,
              `repeat(${Math.min(3, count)}, 1fr)`,
              `repeat(${Math.min(4, count)}, 1fr)`,
              `repeat(${Math.min(5, count)}, 1fr)`,
              `repeat(${Math.min(6, count)}, 1fr)`,
              `repeat(${Math.min(8, count)}, 1fr)`,
            ]}
            gap={6}
            paddingBottom={3}
          >
            {props.requests.map((r) => {
              return (
                <Box w="100%" key={r.id}>
                  {r.type === "personal-badge-mint" && (
                    <BadgeRequestCard request={r} />
                  )}
                  {r.type === "new-account-passkey" && (
                    <PasskeyRequestCard request={r} />
                  )}
                  {r.type !== "personal-badge-mint" &&
                    r.type !== "new-account-passkey" && (
                      <DefaultRequestCard request={r} />
                    )}
                </Box>
              );
            })}
            {props.requests.length === 0 && (
              <Text color="GrayText">No more pending requests</Text>
            )}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
