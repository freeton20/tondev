import { Terminal } from "../../core"
import { Account } from "@eversdk/appkit"
export declare const transormEndpoint: (
    project?: string,
) => (url: string) => string
export declare function getAccount(
    terminal: Terminal,
    args: {
        file: string
        network: string
        signer: string
        data: string
        address?: string
    },
): Promise<Account>
