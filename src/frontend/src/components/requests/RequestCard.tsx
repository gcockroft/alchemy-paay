import {Tooltip, VStack} from "@chakra-ui/react";
import {PropsWithChildren} from "react";

export function RequestCard({
  explinationText,
  children,
}: PropsWithChildren<{explinationText?: string}>) {
  return (
    <Tooltip label={explinationText} placement="auto">
      <VStack
        padding={"5px 10px"}
        boxShadow="0 4px 5px rgba(0, 0, 0, 0.05), 0 6px 5px rgba(0, 0, 0, 0.05)"
        borderRadius={10}
        border={"1px solid rgba(0, 0, 0, 0.15)"}
        alignItems="start"
        maxH={"310px"}
        maxW={"180px"}
        gap={1}
      >
        {children}
      </VStack>
    </Tooltip>
  );
}
