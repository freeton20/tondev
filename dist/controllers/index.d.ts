import { Command, Terminal, ToolController } from "../core";
export declare const controllers: ToolController[];
export declare function findControllerAndCommandByAlias(alias: string): {
    controller: ToolController;
    command: Command;
} | undefined;
export declare function runCommand(terminal: Terminal, name: string, args: any): Promise<void>;
//# sourceMappingURL=index.d.ts.map