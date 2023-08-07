export interface Web3Window extends Window {
  ethereum?: ExternalProvider;
}

export interface AddressUpdateResponse {
  id: number;
  address: string;
}
