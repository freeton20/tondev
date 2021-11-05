"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuite4 = exports.ts4RunCommand = exports.ts4CreateCommand = exports.ts4UpdateCommand = exports.ts4InstallCommand = exports.ts4VersionCommand = void 0;
const path_1 = __importDefault(require("path"));
const core_1 = require("../../core");
const utils_1 = require("../../core/utils");
const components_1 = require("./components");
const snippets_1 = require("./snippets");
exports.ts4VersionCommand = {
    name: "version",
    title: "Show installed and available versions",
    async run(terminal, _args) {
        terminal.log(await core_1.Component.getInfoAll(components_1.components));
    },
};
exports.ts4InstallCommand = {
    name: "install",
    title: "Install a specific release of TestSuite4",
    args: [{
            isArg: true,
            name: 'version',
            type: 'string',
            title: 'TestSuite4 version (semver compatible)',
        }],
    async run(terminal, args) {
        const versions = {
            ...(args.version !== "" ? { ts4: args.version } : {}),
        };
        await core_1.Component.setVersions(terminal, false, components_1.components, versions);
    },
};
exports.ts4UpdateCommand = {
    name: "update",
    title: "Update to the latest version",
    async run(terminal, _args) {
        await core_1.Component.updateAll(terminal, true, components_1.components);
    },
};
exports.ts4CreateCommand = {
    name: "create",
    title: "Create TestSuite4 test",
    args: [{
            isArg: true,
            name: "name",
            title: "Test script name",
            type: "string",
            defaultValue: "Test",
        }, {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        }],
    async run(terminal, args) {
        const filePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.py`);
        const text = snippets_1.BasicTest.split("{name}").join(args.name);
        (0, utils_1.writeTextFile)(filePath, text);
        terminal.log(`TestSuite4 test script ${path_1.default.basename(filePath)} created.`);
    },
};
exports.ts4RunCommand = {
    name: 'run',
    title: 'Run TestSuite4\'s test',
    args: [{
            isArg: true,
            name: 'file',
            type: 'file',
            title: 'Test',
            nameRegExp: /\.py$/i,
        }],
    async run(terminal, args) {
        const ext = path_1.default.extname(args.file);
        if (ext !== ".py") {
            terminal.log(`Choose file *.py`);
            return;
        }
        await core_1.Component.ensureInstalledAll(terminal, components_1.components);
        const fileDir = path_1.default.dirname(args.file);
        const fileName = path_1.default.basename(args.file);
        await components_1.components.ts4.run(terminal, fileDir, [fileName]);
    },
};
exports.TestSuite4 = {
    name: "ts4",
    title: "TestSuite4 framework",
    commands: [
        exports.ts4VersionCommand,
        exports.ts4InstallCommand,
        exports.ts4UpdateCommand,
        exports.ts4CreateCommand,
        exports.ts4RunCommand,
    ],
};
//# sourceMappingURL=index.js.map