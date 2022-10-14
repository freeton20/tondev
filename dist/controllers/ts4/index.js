"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            terminal.log(yield core_1.Component.getInfoAll(components_1.components));
        });
    },
};
exports.ts4InstallCommand = {
    name: "install",
    title: "Install a specific release of TestSuite4",
    args: [
        {
            isArg: true,
            name: "version",
            type: "string",
            title: "TestSuite4 version (semver compatible)",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = Object.assign({}, (args.version !== "" ? { ts4: args.version } : {}));
            yield core_1.Component.setVersions(terminal, false, components_1.components, versions);
        });
    },
};
exports.ts4UpdateCommand = {
    name: "update",
    title: "Update to the latest version",
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.updateAll(terminal, true, components_1.components);
        });
    },
};
exports.ts4CreateCommand = {
    name: "create",
    title: "Create TestSuite4 test",
    args: [
        {
            isArg: true,
            name: "name",
            title: "Test script name",
            type: "string",
            defaultValue: "Test",
        },
        {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, utils_1.uniqueFilePath)(args.folder, `${args.name}{}.py`);
            const text = snippets_1.BasicTest.split("{name}").join(args.name);
            (0, utils_1.writeTextFile)(filePath, text);
            terminal.log(`TestSuite4 test script ${path_1.default.basename(filePath)} created.`);
        });
    },
};
exports.ts4RunCommand = {
    name: "run",
    title: "Run TestSuite4's test",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Test",
            nameRegExp: /\.py$/i,
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const ext = path_1.default.extname(args.file);
            if (ext !== ".py") {
                terminal.log(`Choose file *.py`);
                return;
            }
            yield core_1.Component.ensureInstalledAll(terminal, components_1.components);
            const fileDir = path_1.default.dirname(args.file);
            const fileName = path_1.default.basename(args.file);
            yield components_1.components.ts4.run(terminal, fileDir, [fileName]);
        });
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