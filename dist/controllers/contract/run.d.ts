import { Terminal } from "../../core";
import { AbiFunction, AbiParam, DecodedOutput, Signer } from "@tonclient/core";
import { Account } from "@tonclient/appkit";
export declare function resolveFunction(terminal: Terminal, account: Account, functionName: string, preventUi: boolean): Promise<AbiFunction>;
export declare function resolveParams(terminal: Terminal, prompt: string, params: AbiParam[], paramsString: string, preventUi: boolean): Promise<object>;
export declare function getRunParams(terminal: Terminal, account: Account, args: {
    function: string;
    input: string;
    preventUi: boolean;
    signer: string;
    address: string;
    runSigner: string;
}): Promise<{
    functionName: string;
    functionInput: object;
    signer: Signer;
}>;
export declare function logRunResult(terminal: Terminal, decoded: DecodedOutput | undefined, transaction: any): Promise<void>;
//# sourceMappingURL=run.d.ts.map