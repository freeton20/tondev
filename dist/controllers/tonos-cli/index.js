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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TONOS = exports.tonosVersionCommand = exports.tonosUpdateCommand = exports.tonosSetCommand = exports.tonosInstallCommand = void 0;
const core_1 = require("../../core");
const components_1 = require("./components");
exports.tonosInstallCommand = {
    name: "install",
    title: "Install latest stable TON OS CLI",
    args: [],
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.ensureInstalledAll(terminal, components_1.components);
        });
    },
};
exports.tonosSetCommand = {
    name: "set",
    title: "Change installed version",
    args: [
        {
            name: "version",
            title: "version to install (e.g. 0.8.1 or latest)",
            type: "string",
            defaultValue: "latest",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.setVersions(terminal, false, components_1.components, {
                tonoscli: args.version,
            });
        });
    },
};
exports.tonosUpdateCommand = {
    name: "update",
    title: "Update to the latest version",
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield core_1.Component.updateAll(terminal, false, components_1.components);
        });
    },
};
exports.tonosVersionCommand = {
    name: "version",
    title: "Show installed and available versions",
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            terminal.log(yield core_1.Component.getInfoAll(components_1.components));
        });
    },
};
exports.TONOS = {
    name: "tonos-cli",
    title: "TON OS CLI",
    commands: [
        exports.tonosInstallCommand,
        exports.tonosSetCommand,
        exports.tonosVersionCommand,
        exports.tonosUpdateCommand,
    ],
};
//# sourceMappingURL=index.js.map