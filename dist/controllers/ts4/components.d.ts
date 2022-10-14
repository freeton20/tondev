import { Terminal } from "../../core"
export declare const components: {
    ts4: {
        getCurrentVersion(): Promise<string>
        ensureVersion(
            terminal: Terminal,
            force: boolean,
            requiredVersion?: string,
        ): Promise<boolean>
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
            terminal: Terminal,
            workDir: string,
            args: string[],
        ): Promise<string>
        silentRun(
            terminal: Terminal,
            workDir: string,
            args: string[],
        ): Promise<string>
        getSourceName(version: string): string
        resolveVersion(_downloadedVersion: string): Promise<string>
    }
}
