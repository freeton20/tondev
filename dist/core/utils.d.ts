/// <reference types="node" />
import { SpawnOptionsWithoutStdio } from "child_process"
import { Terminal } from "./index"
import { ContractPackage } from "@eversdk/appkit"
export declare function touch(file: string): Date | undefined
export declare function executableName(name: string): string
export declare function changeExt(path: string, newExt: string): string
export declare function ellipsisString(xs: string[]): string
export declare function loadBinaryVersions(name: string): Promise<string[]>
export declare function formatTokens(
    nanoTokens: string | number | bigint,
): string
export declare function writeTextFile(p: string, s: string): void
export declare function writeJsonFile(p: string, v: unknown): void
export declare function downloadFromGithub(
    terminal: Terminal,
    srcUrl: string,
    dstPath: string,
): Promise<void>
export declare function downloadFromBinaries(
    terminal: Terminal,
    dstPath: string,
    src: string,
    options?: {
        executable?: boolean
        adjustedPath?: string
        globally?: boolean
        version?: string
    },
): Promise<void>
export declare function run(
    name: string,
    args: string[],
    options: SpawnOptionsWithoutStdio,
    terminal: Terminal,
): Promise<string>
export declare function uniqueFilePath(
    folderPath: string,
    namePattern: string,
): string
export declare const consoleTerminal: Terminal
export declare const nullTerminal: Terminal
export declare class StringTerminal implements Terminal {
    stdout: string
    stderr: string
    log(...args: any[]): void
    write(text: string): void
    writeError(text: string): void
}
export declare function versionToNumber(s: string): number
export declare function compareVersions(a: string, b: string): number
export declare function compareVersionsDescending(a: string, b: string): number
export declare function progressLine(terminal: Terminal, line: string): void
export declare function progress(terminal: Terminal, info: string): void
export declare function progressDone(terminal: Terminal): void
export declare function httpsGetJson(url: string): Promise<any>
export declare function userIdentifier(): string
export declare function formatTable(
    table: any[][],
    options?: {
        headerSeparator?: boolean
        multilineSeparator?: boolean
        multilineIndent?: string
    },
): string
export declare function parseNumber(
    s: string | undefined | null,
): number | undefined
export declare function parseNanoTokens(
    s: string | undefined | null,
): number | undefined
export declare function reduceBase64String(
    s: string | undefined,
): string | undefined
export declare function breakWords(s: string, maxLen?: number): string
export declare type ResolvedContractPackage = {
    package: ContractPackage
    abiPath: string
    tvcPath?: string
}
export declare function resolveTvcAsBase64(filePath: string): string
export declare function resolveContract(
    filePath: string,
): ResolvedContractPackage
export declare function isHex(s: string): boolean
export declare function resolvePath(s: string): string
export declare function readTextFileSyncOnce(filename: string): string
export declare function getLatestFromNmp(pkgName: string): Promise<string>
