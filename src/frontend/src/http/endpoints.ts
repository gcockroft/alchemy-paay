import {Nft} from "alchemy-sdk";
import {
  AddressUpdateResponse,
  AdminMemberUpdateResponse,
  AdminMemberUpdateType,
  AdminMembersResponse,
  BaseMember,
  Member,
  MembersResponse,
  RequestStatus,
  Request,
  BadgeCreateData,
  BadgeMetadataResponse,
  BadgeMintRequest,
  Me,
  AppMemberStatus,
  MeStatus,
} from "../declarations/api";
import {OwnedNftsResponse} from "alchemy-sdk";
import {Method, callEndpoint} from "@alch-fam/shared";
import FormData from "form-data";
import {getStoredCredentialId, storeCredentialId} from "../clients/credentials";

export async function createBadgeMetadata(
  data: BadgeCreateData,
): Promise<BadgeMetadataResponse> {
  const url = "/api/badges/metadata";
  const {image, ...rest} = data;

  const formData = new FormData();
  formData.append("image", image);
  formData.append("data", JSON.stringify(rest));
  try {
    return await callEndpoint(Method.POST, url, formData, {
      headers: {
        "Content-Type": `multipart/form-data`,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function getSelfMember(): Promise<Me> {
  const storedCredential = getStoredCredentialId();
  const member: Member = await callEndpoint(Method.GET, "/api/member/me");
  let meStatus: MeStatus = {
    status: AppMemberStatus.UNONBOARDED,
    credentialId: null,
  };
  if (
    storedCredential &&
    Object.values(member.credentialMap).includes(storedCredential)
  ) {
    meStatus = {
      status: AppMemberStatus.LOGGED_IN,
      credentialId: storedCredential,
    };
  } else if (Object.values(member.credentialMap).length > 0) {
    meStatus.status = AppMemberStatus.LOGGED_OUT;
  }
  return {
    ...member,
    ...meStatus,
  };
}

export function getMember(slug: string): Promise<Member> {
  return callEndpoint(Method.GET, `/api/member/${slug}`);
}

export function getMembers(
  pageKey?: string,
  search?: string,
): Promise<MembersResponse> {
  return callEndpoint(Method.GET, `/api/member/all`, {
    pageKey,
    search,
  });
}

export function getMe(): Promise<Member> {
  return callEndpoint(Method.GET, `/api/member/me`);
}

export function updateMemberAddress(
  address: string,
  credentialId: string,
): Promise<AddressUpdateResponse> {
  storeCredentialId(credentialId);
  return callEndpoint(Method.POST, `/api/member/update-address`, {
    address,
    credentialId,
  });
}

export function addCredential(
  credentialId: string,
): Promise<AddressUpdateResponse> {
  return callEndpoint(Method.POST, `/api/member/add-credential`, {
    credentialId,
  });
}

export function mintFamPass(address: string): Promise<`0x${string}`> {
  return callEndpoint(Method.POST, `/api/member/mint-fam-pass`, {
    address,
  }).then(
    (res) => (res as {responseData: {hash: `0x${string}`}}).responseData.hash,
  );
}

export function updateMemberAboutMe(text: string): Promise<{member: Member}> {
  return callEndpoint(Method.POST, `/api/member/update-about-me`, {
    text,
  });
}

export function getMemberBadges(member: Member): Promise<OwnedNftsResponse> {
  return callEndpoint<OwnedNftsResponse>(
    Method.GET,
    `/api/badges/member/${member.id}`,
  );
}

export function adminGetMember(slug: string): Promise<BaseMember> {
  return callEndpoint(Method.GET, `/api/admin/member/${slug}`);
}

export function adminGetMembers(
  pageKey?: string,
): Promise<AdminMembersResponse> {
  return callEndpoint(Method.GET, "/api/admin/members", {
    pageKey,
  });
}

export function adminUpdateMember(
  slug: string,
  member: AdminMemberUpdateType,
): Promise<AdminMemberUpdateResponse> {
  return callEndpoint(Method.PUT, `/api/admin/member/${slug}`, member);
}

export function adminCreateMember(
  member: AdminMemberUpdateType,
): Promise<AdminMemberUpdateResponse> {
  return callEndpoint(Method.POST, `/api/admin/member/create`, member);
}

export function adminDeleteMember(slug: string): Promise<void> {
  return callEndpoint(Method.DELETE, `/api/admin/member/${slug}`);
}

export function getPendingRequests(): Promise<Request[]> {
  return callEndpoint(Method.GET, "/api/requests/", {});
}

export function updateRequestStatus(
  id: number,
  status: RequestStatus,
): Promise<void> {
  return callEndpoint(Method.PUT, `/api/requests/${id}/status`, {
    status,
  });
}

export function getAvailableBadges(): Promise<Nft[]> {
  return callEndpoint<{nfts: Nft[]}>(Method.GET, "/api/badges/").then(
    (res) => res.nfts,
  );
}

export function getBadge(id: number): Promise<Nft> {
  return callEndpoint(Method.GET, `/api/badges/${id}`);
}

export function getRequest(id: number): Promise<Nft> {
  return callEndpoint(Method.GET, `/api/request/${id}`);
}

export function sendBadgeRequest(
  badge: Nft,
  reciever: Member,
  requestDescription: string,
): Promise<Request> {
  const data: BadgeMintRequest = {
    type: "personal-badge-mint",
    reciever: reciever.email,
    image: badge.media[0]?.gateway ?? badge.media[0]?.raw,
    requestDescription,
    ...badge,
  };
  return callEndpoint(Method.POST, "/api/requests/create", data);
}

export function refreshBadgeMetadata(badgeTokenId: string): Promise<Request> {
  return callEndpoint(Method.POST, "/api/badges/refresh", {
    badgeTokenId,
  });
}

export function sendPasskeyRequest(
  member: Member,
  passkeyInformation: {
    credentialId: string;
    publicKey: [string, string];
  },
): Promise<Request> {
  // Get device summary as a short string from user agent or something else
  return callEndpoint(Method.POST, "/api/requests/create", {
    type: "new-account-passkey",
    reciever: member.email,
    device: navigator.userAgent,
    ...passkeyInformation,
  });
}
