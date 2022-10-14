import { Account, AccountGiver } from "@eversdk/appkit"
import { Signer, TonClient } from "@eversdk/core"
import { KnownContract } from "../../core/known-contracts"
import { NetworkGiverInfo } from "./registry"
export declare class NetworkGiver implements AccountGiver {
    contract: KnownContract
    address: string
    info: NetworkGiverInfo
    private send
    account: Account
    value: number | undefined
    name: string | undefined
    constructor(
        contract: KnownContract,
        client: TonClient,
        address: string,
        signer: Signer,
        info: NetworkGiverInfo,
        send: (giver: Account, address: string, value: number) => Promise<void>,
    )
    static create(
        client: TonClient,
        info: NetworkGiverInfo,
    ): Promise<NetworkGiver>
    sendTo(address: string, value: number): Promise<void>
}
