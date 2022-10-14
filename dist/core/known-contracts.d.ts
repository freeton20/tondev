import { ContractPackage } from "@eversdk/appkit"
import { TonClient, AbiContract } from "@eversdk/core"
export declare type KnownContract = {
    name: string
} & ContractPackage
export declare function knownContractFromAddress(
    client: TonClient,
    name: string,
    address: string,
): Promise<KnownContract>
export declare function knownContractByName(name: string): KnownContract
export declare function knownContractFromCodeHash(
    codeHash: string,
    name: string,
    address?: string,
): KnownContract
export declare function loadAbi(name: string): AbiContract
export declare const KnownContracts: {
    [key: string]: KnownContract
}
