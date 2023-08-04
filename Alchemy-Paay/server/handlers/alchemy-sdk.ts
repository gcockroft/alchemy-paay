import { Network, Alchemy, AlchemySettings } from 'alchemy-sdk';

const settings: AlchemySettings = {
    apiKey: "WUVpAqUJdu9pUbz70wDkYii_y5LUUmLc",
    network: Network.MATIC_MUMBAI,
};

export const alchemy: Alchemy = new Alchemy(settings);
