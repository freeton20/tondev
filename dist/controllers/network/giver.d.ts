import { Account, AccountGiver } from "@tonclient/appkit";
import { Signer, TonClient } from "@tonclient/core";
import { KnownContract } from "../../core/known-contracts";
import { NetworkGiverInfo } from "./registry";
export declare class NetworkGiver implements AccountGiver {
    contract: KnownContract;
    address: string;
    info: NetworkGiverInfo;
    private send;
    account: Account;
    value: number | undefined;
    constructor(contract: KnownContract, client: TonClient, address: string, signer: Signer, info: NetworkGiverInfo, send: (giver: Account, address: string, value: number) => Promise<void>);
    static create(client: TonClient, info: NetworkGiverInfo): Promise<NetworkGiver>;
    sendTo(address: string, value: number): Promise<void>;
}
//# sourceMappingURL=giver.d.ts.map