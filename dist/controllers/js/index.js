"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsApps = exports.jsDemoCommand = exports.jsCreateCommand = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const snippets_1 = require("./snippets");
const installer_1 = require("./installer");
const utils_1 = require("../../core/utils");
const wrap_1 = require("./wrap");
exports.jsCreateCommand = {
    name: "create",
    alias: "c",
    title: "Create FreeTON JS App",
    args: [{
            isArg: true,
            name: "name",
            type: "string",
        }, {
            name: "folder",
            type: "folder",
            title: "Target folder (current default)",
        }],
    async run(terminal, args) {
        const appFolderPath = path_1.default.resolve(args.folder, args.name);
        fs_1.default.mkdirSync(appFolderPath, { recursive: true });
        (0, utils_1.writeTextFile)(path_1.default.resolve(appFolderPath, "index.js"), snippets_1.BaseApp.index);
        (0, utils_1.writeTextFile)(path_1.default.resolve(appFolderPath, "package.json"), snippets_1.BaseApp.package);
        terminal.log(`App created in ${appFolderPath}`);
    },
};
exports.jsDemoCommand = {
    name: "demo",
    title: "Download FreeTON Demo",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "folder",
            type: "folder",
            title: "Target folder (current default)",
        },
    ],
    async run(terminal, args) {
        if (args.name === "") {
            const table = [
                ["Demo", "Description"],
                ...(await (0, installer_1.loadInfo)()).applications.map(x => [x.name, x.description]),
            ];
            terminal.log((0, utils_1.formatTable)(table, { headerSeparator: true }));
        }
        else {
            await (0, installer_1.downloadDemo)(terminal, args.name, args.folder);
        }
    },
};
exports.JsApps = {
    name: "js",
    alias: "j",
    title: "JavaScript Code Generators",
    commands: [
        exports.jsCreateCommand,
        exports.jsDemoCommand,
        wrap_1.jsWrapCommand,
    ],
};
//# sourceMappingURL=index.js.map