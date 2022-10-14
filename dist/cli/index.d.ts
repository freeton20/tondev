import { Command, CommandArg, Terminal, ToolController } from "../core"
export declare class CommandLine {
    args: Record<string, string | boolean>
    controller: ToolController | undefined
    command: Command | undefined
    positional: CommandArg[]
    unresolved: Map<string, CommandArg>
    pending: CommandArg | undefined
    printSummaryInfo: boolean
    greedyArgument: CommandArg
    setArgValue(arg: CommandArg, value: string | boolean): void
    resolveValue(arg: CommandArg, value?: string): Promise<void>
    resolveDefault(arg: CommandArg): Promise<void>
    parseOptionName(name: string): Promise<void>
    setCommand(command: Command): void
    parse(programArgs: string[]): Promise<void>
}
export declare function missingArgError(arg: CommandArg): Promise<Error>
export declare function run(terminal: Terminal): Promise<void>
