import { Terminal } from "../../core";
export declare function getInfo(): DemoInfo;
export declare function loadInfo(): Promise<DemoInfo>;
export declare function ensureDemoInstalled(terminal: Terminal): Promise<void>;
export declare type DemoApp = {
    name: string;
    path: string;
    description: string;
};
export declare type DemoInfo = {
    version: string;
    applications: DemoApp[];
};
export declare function downloadDemo(terminal: Terminal, name: string, folder: string): Promise<void>;
//# sourceMappingURL=installer.d.ts.map