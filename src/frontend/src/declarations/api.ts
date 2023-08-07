import {Nft} from "alchemy-sdk";

export enum AppMemberStatus {
  UNONBOARDED,
  LOGGED_IN,
  LOGGED_OUT,
}

export interface BaseMember {
  id: number;
  email: string;
  startDate?: string;
  ethAddress?: string;
  aboutMeMd?: string;
  credentialContext?: string;
  memberStatus?: string;
  permissions?: string[];
}

export type Member = BaseMember & {
  slug: string;
  // Slack fields
  firstName?: string;
  lastName?: string;
  displayName?: string;
  imageUrl?: string;
  tz?: string;
  statusImgUrl?: string;
  statusText?: string;
  hasProfile: boolean;
  title?: string;
  pronouns?: string;
  // Helper Fields
  currentMemberId: number;
  startedBefore: number;
  companyTotal: number;
  permissions: string[];
  credentialMap: {[key: string]: string};
};

export type MeStatus =
  | {
      status: AppMemberStatus.LOGGED_IN;
      credentialId: string;
    }
  | {
      status: AppMemberStatus.LOGGED_OUT | AppMemberStatus.UNONBOARDED;
      credentialId: null;
    };

export type Me = Member & MeStatus;

export interface MembersResponse {
  members: Member[];
  nextPageKey?: string;
  count: number;
}

export interface AdminMembersResponse {
  members: BaseMember[];
  nextPageKey?: string;
  count: number;
}

export type AdminMemberUpdateResponse = BaseMember;
export type AdminMemberUpdateType = Partial<
  Omit<BaseMember, "id" | "aboutMeMd">
>;

export interface AddressUpdateResponse {
  id: number;
  address: string;
}

export type RequestType =
  | "personal-badge-mint"
  | "contract-upgrade"
  | "new-account-passkey";

export type RequestStatus = "open" | "completed" | "rejected";
export interface Request {
  id: number;
  type: RequestType;
  status: RequestStatus;
  reciever: string;
  dateCreated: string;
  sender: string;
  jsonDataContext: string;
}

export interface BadgeRequestData {
  badge: Nft;
  reciever: Member;
  requestDescription: string;
}

export type BadgeMintRequest = {
  type: "personal-badge-mint";
  reciever: string;
  image: string;
  requestDescription: string;
} & Nft;

export type AddPasskeyRequest = {
  type: "new-account-passkey";
  reciever: string;
  device: string;
  credentialId: string;
  publicKey: [string, string];
};

export interface BadgeAttribute {
  attribute: string;
  value: string;
}

export interface BadgeCreateData {
  title: string;
  description: string;
  attributes: BadgeAttribute[];
  image: File | null;
}

export interface BadgeMetadataResponse {
  metadata: {
    title: string;
    description: string;
    attributes: BadgeAttribute[];
    image: string;
  };
  metadataUrl: string;
}
