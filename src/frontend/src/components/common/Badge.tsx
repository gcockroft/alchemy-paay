import {Tooltip, Image, Tag, Box, BoxProps} from "@chakra-ui/react";
import {Nft} from "alchemy-sdk";
import {PropsWithChildren} from "react";
import {Link} from "react-router-dom";
import {OPEN_SEA_ROUTE} from "../../constants";

export function EmptyBadge({
  children,
  ...boxProps
}: PropsWithChildren<BoxProps>) {
  return (
    <Box
      minH="75px"
      minW="75px"
      maxH="75px"
      maxW="75px"
      borderRadius="md"
      backgroundColor="gray.300"
      {...boxProps}
    >
      {children}
    </Box>
  );
}

export function Badge({
  nft,
  balance,
  size,
}: {
  nft: Nft;
  balance?: number;
  size?: string;
}) {
  return (
    <Link
      to={`${OPEN_SEA_ROUTE}/${nft.contract.address}/${Number(nft.tokenId)}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{display: "block"}}
    >
      <Tooltip label={nft.title}>
        <Box position="relative">
          <Image
            src={nft.media[0]?.gateway ?? nft.media[0]?.raw}
            minH={size ?? "75px"}
            minW={size ?? "75px"}
            maxH={size ?? "75px"}
            maxW={size ?? "75px"}
            objectFit="cover"
            alt="nft"
            borderRadius="md"
          />
          {(balance ?? 1) > 1 && (
            <Tag
              height="10px"
              width="10px"
              borderRadius="50%"
              colorScheme="blue"
              position="absolute"
              top="-7px"
              left="-7px"
            >
              {balance}
            </Tag>
          )}
        </Box>
      </Tooltip>
    </Link>
  );
}
