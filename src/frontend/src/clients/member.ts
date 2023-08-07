import {useQuery, useInfiniteQuery, useMutation} from "@tanstack/react-query";
import {
  addCredential,
  getMember,
  getMembers,
  getPendingRequests,
  getSelfMember,
} from "../http/endpoints";
import {useParams} from "react-router-dom";
import {queryClient} from "./query";
import {
  AddPasskeyRequest,
  AddressUpdateResponse,
  Member,
} from "../declarations/api";
import {useMyWallet} from "../context/myWallet";
import {encodeFunctionData} from "viem";
import {passkeyAccountABI} from "@alch-fam/shared";
import {useMe} from "../context/me";
import {pollForLambdaForComplete} from "../util/poll";

export function useMeQuery() {
  return useQuery(["me"], getSelfMember);
}

export function useMemberQuery() {
  const {slug} = useParams();
  return useQuery(["member", slug], () => getMember(slug!));
}

export function useMembersQuery() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery(
      ["members"],
      async (params) => {
        const result = await getMembers(params.pageParam);
        return result;
      },
      {
        onSuccess(data) {
          data.pages.forEach((page) => {
            page.members.forEach((member) => {
              updateMemberQueries(member);
            });
          });
        },
        getNextPageParam: (lastResult) => {
          return lastResult.nextPageKey;
        },
      },
    );
  const members = data?.pages.flatMap((page) => page.members) || [];
  return {
    members,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export function updateMemberQueries(member: Member) {
  if (!member) return;
  if (member.id === member.currentMemberId) {
    queryClient.setQueryData(["member", "me"], () => member);
  }
  queryClient.setQueryData(["member", member.id], () => member);
  queryClient.setQueryData(["member", member.slug], () => member);
}

export function useRequestsQuery(member: Member) {
  return useQuery(["requests", member.id], async () => {
    return await getPendingRequests();
  });
}

export function usePasskeyAcceptMutation(request: AddPasskeyRequest) {
  const me = useMe();
  const {walletProivder, address} = useMyWallet();
  return useMutation<
    {opHash: `0x${string}`} & AddressUpdateResponse,
    Error,
    void,
    unknown
  >(
    async () => {
      const origin = window.location.origin;
      const op = await walletProivder.sendUserOperation({
        target: address,
        data: encodeFunctionData({
          abi: passkeyAccountABI,
          functionName: "addPasskey",
          args: [
            request.credentialId,
            origin,
            request.publicKey as unknown as [bigint, bigint],
          ],
        }),
      });
      const opHash = op.hash as `0x${string}`;
      pollForLambdaForComplete(async () => {
        return walletProivder
          .getUserOperationReceipt(opHash)
          .then((receipt) => {
            return receipt !== null;
          })
          .catch(() => {
            return false;
          });
      });
      const response = await addCredential(request.credentialId!);
      return {
        opHash,
        ...response,
      };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["me"]);
        queryClient.invalidateQueries(["member", me.id]);
      },
    },
  );
}
