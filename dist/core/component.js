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
exports.Component = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const _1 = require("./");
const fs_1 = __importDefault(require("fs"));
class Component {
    constructor(toolFolderName, name, options) {
        var _a, _b, _c, _d, _e;
        this.toolFolderName = toolFolderName;
        this.name = name;
        this.isExecutable = (_a = options === null || options === void 0 ? void 0 : options.isExecutable) !== null && _a !== void 0 ? _a : false;
        this.runGlobally = (_b = options === null || options === void 0 ? void 0 : options.runGlobally) !== null && _b !== void 0 ? _b : false;
        this.resolveVersionRegExp =
            (_c = options === null || options === void 0 ? void 0 : options.resolveVersionRegExp) !== null && _c !== void 0 ? _c : /Version:\s*([0-9.]+)/;
        this.targetName = (_d = options === null || options === void 0 ? void 0 : options.targetName) !== null && _d !== void 0 ? _d : name;
        if (this.isExecutable) {
            this.targetName = (0, utils_1.executableName)(this.targetName);
        }
        this.innerPath = options === null || options === void 0 ? void 0 : options.innerPath;
        this.hidden = (_e = options === null || options === void 0 ? void 0 : options.hidden) !== null && _e !== void 0 ? _e : false;
    }
    home() {
        return this.toolFolderName !== ""
            ? path_1.default.resolve((0, _1.everdevHome)(), this.toolFolderName)
            : "";
    }
    path() {
        return this.runGlobally && this.toolFolderName === ""
            ? this.targetName
            : path_1.default.resolve(this.home(), this.targetName);
    }
    adjustedPath() {
        return this.innerPath !== undefined
            ? path_1.default.resolve(this.home(), this.innerPath)
            : undefined;
    }
    run(terminal, workDir, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const out = yield (0, utils_1.run)((_a = this.adjustedPath()) !== null && _a !== void 0 ? _a : this.path(), args, { cwd: workDir }, terminal);
            return out.replace(/\r?\n/g, "\r\n");
        });
    }
    silentRun(terminal, workDir, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const runTerminal = new utils_1.StringTerminal();
            try {
                const result = yield this.run(runTerminal, workDir, args);
                // Solidity compiler successfully compiles code despite outputting
                // warnings to stderr, so we have to print them:
                if (runTerminal.stderr !== "") {
                    terminal.log(runTerminal.stderr);
                }
                return result;
            }
            catch (error) {
                if (runTerminal.stdout !== "") {
                    terminal.write(runTerminal.stdout);
                }
                if (runTerminal.stderr !== "") {
                    terminal.writeError(runTerminal.stderr);
                }
                throw error;
            }
        });
    }
    getSourceName(version) {
        return `${this.name}_${version.split(".").join("_")}_{p}.gz`;
    }
    loadAvailableVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, utils_1.loadBinaryVersions)(this.name);
        });
    }
    resolveVersion(_downloadedVersion) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(this.path())) {
                const isDeprecatedVersion = !!_downloadedVersion.match(/^0.21.0$|^0.1.21$/);
                const stringTerminal = new utils_1.StringTerminal();
                const compilerOut = yield this.run(stringTerminal, process.cwd(), [
                    "--version",
                ]);
                return isDeprecatedVersion
                    ? _downloadedVersion
                    : (_b = (_a = compilerOut.match(this.resolveVersionRegExp)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : "";
            }
            return "";
        });
    }
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const infoPath = `${this.path()}.json`;
            if (fs_1.default.existsSync(infoPath)) {
                try {
                    const info = JSON.parse(fs_1.default.readFileSync(infoPath, "utf8"));
                    if (info.version) {
                        return info.version;
                    }
                }
                catch (_a) { } // eslint-disable-line no-empty
            }
            return this.resolveVersion("");
        });
    }
    ensureVersion(terminal, force, requiredVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getCurrentVersion();
            if (!force && current !== "" && !requiredVersion) {
                return false;
            }
            let version = (requiredVersion !== null && requiredVersion !== void 0 ? requiredVersion : "latest").toLowerCase();
            if (!force && version === current) {
                return false;
            }
            const available = yield this.loadAvailableVersions();
            if (version === "latest") {
                version = available[0];
            }
            else {
                if (!available.includes(version)) {
                    throw new Error(`Invalid ${this.name} version ${version}`);
                }
            }
            if (!force && version === current) {
                return false;
            }
            const sourceName = this.getSourceName(version);
            yield (0, utils_1.downloadFromBinaries)(terminal, this.path(), sourceName, {
                executable: this.isExecutable,
                adjustedPath: this.adjustedPath(),
                globally: this.runGlobally,
                version,
            });
            const info = {
                version: yield this.resolveVersion(version),
            };
            (0, utils_1.writeJsonFile)(`${this.path()}.json`, info);
            return true;
        });
    }
    static ensureInstalledAll(terminal, components) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const component of Object.values(components)) {
                yield component.ensureVersion(terminal, false);
            }
        });
    }
    static setVersions(terminal, force, components, versions) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasUpdates = false;
            for (const [name, component] of Object.entries(components)) {
                if (yield component.ensureVersion(terminal, force, versions[name])) {
                    hasUpdates = true;
                }
            }
            if (hasUpdates) {
                terminal.log(yield this.getInfoAll(components));
            }
            else {
                terminal.log("All components already up to date.");
            }
        });
    }
    static updateAll(terminal, force, components) {
        return __awaiter(this, void 0, void 0, function* () {
            const latest = {};
            for (const name of Object.keys(components)) {
                latest[name] = "latest";
            }
            yield this.setVersions(terminal, force, components, latest);
        });
    }
    static getInfoAll(components) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const table = [["Component", "Version", "Available"]];
            const files = [];
            let hasNotInstalledComponents = false;
            for (const [name, component] of Object.entries(components)) {
                const version = yield component.getCurrentVersion();
                if (version === "") {
                    hasNotInstalledComponents = true;
                }
                const allVersions = yield component.loadAvailableVersions();
                if (!component.hidden) {
                    table.push([
                        name,
                        version !== "" ? version : "not installed",
                        (0, utils_1.ellipsisString)(allVersions),
                    ]);
                    if (version !== "") {
                        const filename = (_a = component.adjustedPath()) !== null && _a !== void 0 ? _a : component.path();
                        if (filename) {
                            files.push(filename);
                        }
                    }
                }
            }
            let info = (0, utils_1.formatTable)(table, { headerSeparator: true });
            if (hasNotInstalledComponents) {
                info +=
                    "\n\nMissing components will be automatically installed  on first demand.";
            }
            else if (files.length !== 0) {
                info += "\n\nFile path: " + files.join("; ");
            }
            return info;
        });
    }
}
exports.Component = Component;
//# sourceMappingURL=component.js.map