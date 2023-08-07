import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Code,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalProps,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import {UseMutationResult} from "@tanstack/react-query";
import {MultiActionError, MultiActionStep} from "./MultiAction";

export function MultiActionProgressModal<Identiifer, Context>({
  multiActionMutation,
  currentStep,
  onClose,
  ...modalProps
}: {
  multiActionMutation: UseMutationResult<void, MultiActionError, void, unknown>;
  currentStep: MultiActionStep<Identiifer, Context>;
  onClose?: () => void;
} & Omit<ModalProps, "isOpen" | "onClose" | "children">) {
  return (
    <Modal
      isOpen={!multiActionMutation.isIdle}
      onClose={() => {
        onClose?.();
        multiActionMutation.reset();
      }}
      closeOnOverlayClick={false}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent
        display="flex"
        alignSelf="center"
        minW={["80%", "80%", "750px"]}
        maxH="500px"
        h="50vh"
      >
        <ModalCloseButton />
        <ModalBody
          flex={1}
          display="flex"
          alignItems="center"
          paddingTop="25px"
          overflow="auto"
          gap="10px"
        >
          <VStack
            flex={1}
            padding="10px"
            borderRight="1px dashed lightgray"
            alignItems="start"
            justifyContent="center"
            h="100%"
          >
            <HStack
              gap={0}
              alignItems="start"
              flexDirection={["column", "column", "row"]}
            >
              <Box
                transition="max-width 0.6s ease-in-out"
                maxW={multiActionMutation.isError ? "100%" : "0px"}
                overflow="hidden"
              >
                <Heading
                  color="red"
                  size="lg"
                  paddingRight="5px"
                  wordBreak="keep-all"
                  maxH="40px"
                  margin="0px"
                >
                  Failed:
                </Heading>
              </Box>
              <Heading
                color={multiActionMutation.isError ? "red" : undefined}
                size="lg"
                transition="all 0.3s ease-in-out"
                style={{margin: 0}}
              >
                {currentStep.title}
              </Heading>
            </HStack>

            {typeof currentStep.description === "string" ? (
              <Heading size="sm" minH="40px" overflow="auto">
                {currentStep.description}
              </Heading>
            ) : (
              currentStep.description
            )}
            <Box
              flex={multiActionMutation.isError ? 1 : 0}
              transition="all 0.3s ease-in-out"
              overflow="auto"
            >
              <Code
                color={multiActionMutation.isError ? "red" : undefined}
                background="#00000000"
                wordBreak="break-word"
                paddingRight="10px"
              >
                {multiActionMutation.error?.cause && (
                  <b>
                    {multiActionMutation.error.cause.message} (
                    {multiActionMutation.error.cause.code})
                  </b>
                )}
                {!multiActionMutation.error?.cause && (
                  <b>{`${multiActionMutation.error}`}</b>
                )}
                {multiActionMutation.error?.metaMessages?.map((v, i) => (
                  <Box key={i}>{v}</Box>
                ))}
              </Code>
            </Box>
          </VStack>
          <CircularProgress
            value={currentStep.percent}
            color={
              currentStep.percent === 100
                ? "green.500"
                : multiActionMutation.isError
                ? "red"
                : "blue.500"
            }
            position="relative"
            size="100px"
          >
            <Spinner
              position="absolute"
              width="95px"
              height="95px"
              top="2px"
              left="2px"
              color="blue.300"
              thickness="10px"
              opacity={
                currentStep.percent === 100 || multiActionMutation.isError
                  ? 0
                  : 0.3
              }
              transition="opacity 0.3s ease-in-out"
            />

            <CircularProgressLabel>
              {currentStep.percent}%
            </CircularProgressLabel>
          </CircularProgress>
        </ModalBody>
        <ModalFooter>
          <HStack>
            {multiActionMutation.isError && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  multiActionMutation.mutate();
                }}
              >
                ⤴ Retry Step
              </Button>
            )}
            {currentStep.percent !== 100 && (
              <Button
                colorScheme="red"
                onClick={() => {
                  multiActionMutation.reset();
                }}
              >
                Quit
              </Button>
            )}
            {currentStep.percent === 100 && (
              <Button
                colorScheme="blue.500"
                onClick={() => {
                  multiActionMutation.reset();
                }}
              >
                Accept
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
