import { Terminal } from "./";
export declare type ComponentOptions = {
    /**
     * Component is an executable file.
     */
    isExecutable?: boolean;
    /**
     * Component must be aliased to run globally.
     */
    runGlobally?: boolean;
    /**
     * Regular expression to extract version from
     * components --version output.
     */
    resolveVersionRegExp?: RegExp;
    /**
     * Target name for a component file. In some cases targetName is a path to folder.
     */
    targetName?: string;
    /**
     * Path to executable file name inside targetName (when targetName is a directory)
     */
    innerPath?: string;
};
export declare class Component {
    toolFolderName: string;
    name: string;
    isExecutable: boolean;
    runGlobally: boolean;
    resolveVersionRegExp: RegExp;
    targetName: string;
    innerPath?: string;
    constructor(toolFolderName: string, name: string, options?: ComponentOptions);
    home(): string;
    path(): string;
    adjustedPath(): string | undefined;
    run(terminal: Terminal, workDir: string, args: string[]): Promise<string>;
    silentRun(terminal: Terminal, workDir: string, args: string[]): Promise<string>;
    getSourceName(version: string): string;
    loadAvailableVersions(): Promise<string[]>;
    resolveVersion(_downloadedVersion: string): Promise<string>;
    getCurrentVersion(): Promise<string>;
    ensureVersion(terminal: Terminal, force: boolean, requiredVersion?: string): Promise<boolean>;
    static ensureInstalledAll(terminal: Terminal, components: {
        [name: string]: Component;
    }): Promise<void>;
    static setVersions(terminal: Terminal, force: boolean, components: {
        [name: string]: Component;
    }, versions: {
        [name: string]: any;
    }): Promise<void>;
    static updateAll(terminal: Terminal, force: boolean, components: {
        [name: string]: Component;
    }): Promise<void>;
    static getInfoAll(components: {
        [name: string]: Component;
    }): Promise<string>;
}
//# sourceMappingURL=component.d.ts.map