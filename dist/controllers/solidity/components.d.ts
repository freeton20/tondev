import { Component } from "../../core"
export declare const components: {
    compiler: Component
    linker: Component
    stdlib: {
        getSourceName(version: string): string
        resolveVersion(downloadedVersion: string): Promise<string>
        loadAvailableVersions(): Promise<string[]>
        isExecutable: boolean
        runGlobally: boolean
        resolveVersionRegExp: RegExp
        targetName: string
        innerPath?: string
        hidden?: boolean
        toolFolderName: string
        name: string
        home(): string
        path(): string
        adjustedPath(): string
        run(
            terminal: import("../../core").Terminal,
            workDir: string,
            args: string[],
        ): Promise<string>
        silentRun(
            terminal: import("../../core").Terminal,
            workDir: string,
            args: string[],
        ): Promise<string>
        getCurrentVersion(): Promise<string>
        ensureVersion(
            terminal: import("../../core").Terminal,
            force: boolean,
            requiredVersion?: string,
        ): Promise<boolean>
    }
}
