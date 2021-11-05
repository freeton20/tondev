import { ContainerDef, DevDocker } from "../../core/docker";
export declare function getAvailableVersions(): Promise<string[]>;
export declare function controlInstances(control: (docker: DevDocker, def: ContainerDef) => Promise<void>, version?: string): Promise<void>;
//# sourceMappingURL=installer.d.ts.map