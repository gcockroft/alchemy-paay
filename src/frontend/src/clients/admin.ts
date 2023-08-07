import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {adminGetMember, adminGetMembers} from "../http/endpoints";
import {useParams} from "react-router-dom";

export function useAdminMemberQuery() {
  const {slug} = useParams();
  return useQuery(["admin_member", slug], () => adminGetMember(slug!));
}

export function useAdminMembersQuery() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery(
      ["admin_members"],
      async (params) => {
        const result = await adminGetMembers(params.pageParam);
        return result;
      },
      {
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
