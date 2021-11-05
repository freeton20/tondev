export declare type NetworkGiverInfo = {
    name: string;
    address: string;
    signer: string;
    value?: number;
};
export declare type Network = {
    name: string;
    description?: string;
    endpoints: string[];
    giver?: NetworkGiverInfo;
};
declare type NetworkSummary = {
    name: string;
    endpoints: string;
    giver: string;
    description: string;
};
export declare function getGiverSummary(giver?: NetworkGiverInfo): string;
export declare class NetworkRegistry {
    readonly items: Network[];
    default?: string;
    constructor();
    save(): void;
    add(name: string, description: string, endpoints: string[], overwrite: boolean): void;
    get(name: string): Network;
    delete(name: string): void;
    setDefault(name: string): void;
    setGiver(name: string, address: string, signer: string, value: number | undefined): Promise<void>;
    static getEndpointsSummary(network: Network): string;
    getNetworkSummary(network: Network): NetworkSummary;
}
export {};
//# sourceMappingURL=registry.d.ts.map