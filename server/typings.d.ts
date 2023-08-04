export interface User {
    id: string;
    createdAt: string;
    paymentsMade: string;
    gasSponsored: string;
    ethAddress: string;
    // do we also want an email? maybe we could include the ens domain in this?
}