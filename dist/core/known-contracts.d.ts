import { ContractPackage } from "@tonclient/appkit";
import { TonClient, AbiContract } from "@tonclient/core";
export declare type KnownContract = {
    name: string;
} & ContractPackage;
export declare function knownContractFromAddress(client: TonClient, name: string, address: string): Promise<KnownContract>;
export declare function knownContractFromCodeHash(codeHash: string, name: string, address?: string): KnownContract;
export declare function loadAbi(name: string): AbiContract;
export declare const KnownContracts: {
    GiverV2: {
        name: string;
        abi: AbiContract;
    };
    SetcodeMultisigWallet: {
        name: string;
        abi: AbiContract;
    };
    SafeMultisigWallet: {
        name: string;
        abi: AbiContract;
    };
};
//# sourceMappingURL=known-contracts.d.ts.map