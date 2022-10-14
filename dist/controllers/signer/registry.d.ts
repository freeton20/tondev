import { Terminal } from "../../core"
import { KeyPair, Signer } from "@eversdk/core"
import { NetworkRegistry } from "../network/registry"
export declare enum MnemonicDictionary {
    ton = 0,
    english = 1,
    chineseSimplified = 2,
    chineseTraditional = 3,
    french = 4,
    italian = 5,
    japanese = 6,
    korean = 7,
    spanish = 8,
}
export declare type SignerRegistryItem = {
    name: string
    description: string
    keys: KeyPair
    mnemonic?: {
        phrase: string
        dictionary: MnemonicDictionary
    }
}
export declare type SignerSummary = {
    name: string
    public: string
    description: string
    used: string
}
export declare type ResolveSignerOptions = {
    useNoneForEmptyName: boolean
}
export declare class SignerRegistry {
    items: SignerRegistryItem[]
    default?: string
    constructor()
    save(): void
    add(
        _terminal: Terminal,
        args: {
            name: string
            secret: string
            dictionary: string
            force: boolean
        },
    ): Promise<void>
    private addItem
    addSecretKey(
        name: string,
        description: string,
        secret: string,
        overwrite: boolean,
    ): Promise<void>
    addMnemonicKey(
        name: string,
        description: string,
        phrase: string,
        dictionary: MnemonicDictionary,
        overwrite: boolean,
    ): Promise<void>
    find(name: string): SignerRegistryItem | undefined
    get(name: string): SignerRegistryItem
    delete(name: string): void
    setDefault(name: string): void
    resolveItem(
        name: string,
        options: ResolveSignerOptions,
    ): SignerRegistryItem | null
    createSigner(item: SignerRegistryItem | null): Promise<Signer>
    resolveSigner(name: string, options: ResolveSignerOptions): Promise<Signer>
    getSignerSummary(
        signer: SignerRegistryItem,
        networks: NetworkRegistry,
    ): SignerSummary
}
