import {UseQueryResult, useMutation, useQuery} from "@tanstack/react-query";
import {
  createBadgeMetadata,
  getMemberBadges,
  getPendingRequests,
  refreshBadgeMetadata,
  sendBadgeRequest,
  updateRequestStatus,
} from "../http/endpoints";
import {
  BadgeAttribute,
  BadgeCreateData,
  BadgeMintRequest,
  Member,
  RequestStatus,
} from "../declarations/api";
import {queryClient} from "./query";
import {Nft, OwnedNftsResponse} from "alchemy-sdk";
import {useMyWallet} from "../context/myWallet";
import {
  ALCHEMY_BADGE_CONTRACT_ADDRESS,
  ALCHEMY_BADGE_OPERATOR_ADDRESS,
  alchemyBadgesABI,
  alchemyBadgesOperatorABI,
} from "@alch-fam/shared";
import {TransactionReceipt, encodeFunctionData} from "viem";
import {
  MultiActionStep,
  useMultiActionOrchestrator,
} from "../components/common/MultiAction";
import {useMemo} from "react";
import {decodeEventLog} from "viem";

const FAAM_BADGE_TOKEN_ID = parseInt("0x01", 16);

export enum BadgeCreateStepIdentifier {
  UPLOAD_METADATA_AND_IMAGE = "UPLOAD_METADATA_AND_IMAGE",
  UPLOAD_BADGE = "UPLOAD_BADGE",
  UPDATE_BADGE_CONTRACT = "UPDATE_BADGE_CONTRACT",
  DONE = "DONE",
}

export interface BadgeCreateStepContext {
  metadata: {
    title: string;
    description: string;
    attributes: BadgeAttribute[];
    image: string;
  };
  metadataUrl: string;
  updateContractTxnHash: `0x${string}`;
  mintParentBadgeHash: `0x${string}`;
}

type BadgeCreateHandlers = Record<
  BadgeCreateStepIdentifier,
  (
    data: BadgeCreateData,
    context: Partial<BadgeCreateStepContext>,
  ) => Promise<
    MultiActionStep<BadgeCreateStepIdentifier, BadgeCreateStepContext>
  >
>;

export function useMemberBadgesQuery(member: Member) {
  return useQuery(["nfts", member.id], () => {
    if (member.ethAddress) {
      return getMemberBadges(member);
    } else {
      return Promise.resolve({data: []} as unknown as OwnedNftsResponse);
    }
  });
}

export function useBadgeRequestsQuery(member: Member) {
  return useQuery(["requests", member.id], async () => {
    const requests = await getPendingRequests().then((requests) => {
      return requests.filter(
        (request) => request.type === "personal-badge-mint",
      );
    });
    return {
      showBadgeRequests: member.ethAddress && requests && requests.length > 0,
      requests,
    };
  });
}

export function useMutateRequestStatus(member: Member) {
  return useMutation<
    void,
    Error,
    {
      id: number;
      status: RequestStatus;
    },
    unknown
  >(["requests", member.id], (params: {id: number; status: RequestStatus}) => {
    return updateRequestStatus(params.id, params.status).then(() => {
      queryClient.invalidateQueries(["requests", member.id]);
    });
  });
}

export function useCreateBadgeRequest(member: Member, onSuccess?: () => void) {
  return useMutation(
    ["requests", member.id],
    ({
      badge,
      reciever,
      description,
    }: {
      badge: Nft;
      reciever: Member;
      description: string;
    }) => {
      return sendBadgeRequest(badge, reciever, description);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requests", member.id]);
        onSuccess?.();
      },
    },
  );
}

export function useFaamBadgeQuery(
  member: Member,
): UseQueryResult<Nft | undefined> {
  const ownedNFTsQuery = useMemberBadgesQuery(member);
  if (ownedNFTsQuery.data === undefined) {
    return ownedNFTsQuery as unknown as UseQueryResult<Nft | undefined>;
  } else {
    const faamBadge = ownedNFTsQuery.data?.ownedNfts?.find((nftData: Nft) => {
      return parseInt(nftData.tokenId) === FAAM_BADGE_TOKEN_ID;
    });
    return {
      ...ownedNFTsQuery,
      data: faamBadge,
    } as unknown as UseQueryResult<Nft | undefined>;
  }
}

export function useBadgeAcceptMutation(request: BadgeMintRequest) {
  const {walletProivder, address} = useMyWallet();
  return useMutation<`0x${string}`, Error, void, unknown>(
    async () => {
      const mintDeployTxnHash = await walletProivder.sendTransaction({
        from: address,
        to: ALCHEMY_BADGE_OPERATOR_ADDRESS,
        data: encodeFunctionData({
          abi: alchemyBadgesOperatorABI,
          functionName: "mintBadge",
          args: [BigInt(request.tokenId), BigInt(1)],
        }),
      });
      return mintDeployTxnHash;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["badges"]);
        queryClient.invalidateQueries(["nfts"]);
      },
    },
  );
}

function getBadgeMintedEvent(receipt: TransactionReceipt) {
  for (const log of receipt.logs) {
    try {
      const topics = decodeEventLog({
        abi: alchemyBadgesABI,
        data: log.data,
        topics: log.topics,
      });
      if (topics.eventName === "TransferSingle") {
        const to = topics.args["to"]?.toLowerCase();
        if (
          to?.toLowerCase() === ALCHEMY_BADGE_CONTRACT_ADDRESS.toLowerCase()
        ) {
          return topics;
        }
      }
    } catch (e) {}
  }
  return undefined;
}

export function useBadgeCreationMutation(
  badgeCreateData: BadgeCreateData,
  component: ({
    helperText,
    context,
  }: {
    helperText?: string | undefined;
    context: {
      metadata: {
        title: string;
        description: string;
        attributes: BadgeAttribute[];
        image: string;
      };
      metadataUrl: string;
    };
  }) => JSX.Element,
) {
  const {walletProivder, address} = useMyWallet();
  const badgeCreateHandlers: BadgeCreateHandlers = useMemo(() => {
    return {
      [BadgeCreateStepIdentifier.UPLOAD_METADATA_AND_IMAGE]: async () => {
        // Wait for 10 seconds to simulate a long-running process
        const response = await createBadgeMetadata(badgeCreateData);
        return {
          percent: 50,
          description: component({
            context: response,
            helperText: "Add this new badge to the blockchain...",
          }),
          title: "Uploading Badge",
          identifier: BadgeCreateStepIdentifier.UPLOAD_BADGE,
          context: {
            ...response,
          },
        };
      },
      [BadgeCreateStepIdentifier.UPLOAD_BADGE]: async (_, context) => {
        // Send a transaction to out nft contract to add a token spec for this badge
        // We also want it sponsored by our paymaster.
        const updateContractTxnHash = await walletProivder?.sendTransaction({
          from: address,
          to: ALCHEMY_BADGE_OPERATOR_ADDRESS,
          data: encodeFunctionData({
            abi: alchemyBadgesOperatorABI,
            functionName: "addBadge",
            args: [context.metadataUrl!],
          }),
        });
        return {
          percent: 75,
          description: component({
            context: context as BadgeCreateStepContext,
            helperText:
              "Updating the Badge Contract so it knows about this new badge!",
          }),
          title: "Updating the Badge Contract",
          identifier: BadgeCreateStepIdentifier.UPDATE_BADGE_CONTRACT,
          context: {
            updateContractTxnHash,
          },
        };
      },
      [BadgeCreateStepIdentifier.UPDATE_BADGE_CONTRACT]: async (_, context) => {
        const receipt = await walletProivder.rpcClient.getTransactionReceipt({
          hash: context.updateContractTxnHash!,
        });
        const event = getBadgeMintedEvent(receipt);
        if (!event) {
          throw new Error("Could not find badge id event");
        }
        const badgeTokenId = event.args.id!;
        await refreshBadgeMetadata(`${badgeTokenId}`);
        return {
          percent: 100,
          description: component({
            helperText: "Your badge has been created!",
            context: context as BadgeCreateStepContext,
          }),
          title: "All Done!",
          identifier: BadgeCreateStepIdentifier.DONE,
          context: {},
        };
      },
      [BadgeCreateStepIdentifier.DONE]: async (_, context) => {
        return {
          percent: 100,
          description: component({
            helperText: "Your badge has been created!",
            context: context as BadgeCreateStepContext,
          }),
          title: "All Done!",
          identifier: BadgeCreateStepIdentifier.DONE,
          context: {},
        };
      },
    };
  }, [badgeCreateData, walletProivder, address, component]);

  const {go, reset, currentStep} = useMultiActionOrchestrator<
    BadgeCreateData,
    BadgeCreateStepIdentifier,
    unknown
  >(
    badgeCreateData,
    {
      percent: 0,
      description: "Metadata and image will be uploaded to our remote servers.",
      title: "Upload Metadata and Image",
      identifier: BadgeCreateStepIdentifier.UPLOAD_METADATA_AND_IMAGE,
      context: {},
    },
    badgeCreateHandlers,
  );

  const mutation = useMutation<
    void,
    {
      cause: {
        code: number;
        message: string;
      };
      metaMessages: string[];
    },
    void,
    unknown
  >(go, {
    onSuccess: () => {
      queryClient.invalidateQueries(["badges"]);
    },
  });

  return {
    mutation,
    reset,
    currentStep,
  };
}
