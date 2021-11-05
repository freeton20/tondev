"use strict";
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
        var _a, _b, _c, _d;
        this.toolFolderName = toolFolderName;
        this.name = name;
        this.isExecutable = (_a = options === null || options === void 0 ? void 0 : options.isExecutable) !== null && _a !== void 0 ? _a : false;
        this.runGlobally = (_b = options === null || options === void 0 ? void 0 : options.runGlobally) !== null && _b !== void 0 ? _b : false;
        this.resolveVersionRegExp = (_c = options === null || options === void 0 ? void 0 : options.resolveVersionRegExp) !== null && _c !== void 0 ? _c : /Version:\s*([0-9.]+)/;
        this.targetName = (_d = options === null || options === void 0 ? void 0 : options.targetName) !== null && _d !== void 0 ? _d : name;
        if (this.isExecutable) {
            this.targetName = (0, utils_1.executableName)(this.targetName);
        }
        this.innerPath = options === null || options === void 0 ? void 0 : options.innerPath;
    }
    home() {
        return this.toolFolderName !== "" ? path_1.default.resolve((0, _1.tondevHome)(), this.toolFolderName) : "";
    }
    path() {
        return (this.runGlobally && this.toolFolderName === "")
            ? this.targetName
            : path_1.default.resolve(this.home(), this.targetName);
    }
    adjustedPath() {
        return this.innerPath !== undefined ? path_1.default.resolve(this.home(), this.innerPath) : undefined;
    }
    async run(terminal, workDir, args) {
        var _a;
        const out = await (0, utils_1.run)((_a = this.adjustedPath()) !== null && _a !== void 0 ? _a : this.path(), args, { cwd: workDir }, terminal);
        return out.replace(/\r?\n/g, "\r\n");
    }
    async silentRun(terminal, workDir, args) {
        const runTerminal = new utils_1.StringTerminal();
        try {
            return await this.run(runTerminal, workDir, args);
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
    }
    getSourceName(version) {
        return `${this.name}_${version.split(".").join("_")}_{p}.gz`;
    }
    async loadAvailableVersions() {
        return (0, utils_1.loadBinaryVersions)(this.name);
    }
    async resolveVersion(_downloadedVersion) {
        var _a, _b;
        if (fs_1.default.existsSync(this.path())) {
            const compilerOut = await this.run(utils_1.nullTerminal, process.cwd(), ["--version"]);
            return (_b = (_a = compilerOut.match(this.resolveVersionRegExp)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : "";
        }
        return "";
    }
    async getCurrentVersion() {
        const infoPath = `${this.path()}.json`;
        if (fs_1.default.existsSync(infoPath)) {
            try {
                const info = JSON.parse(fs_1.default.readFileSync(infoPath, "utf8"));
                if (info.version) {
                    return info.version;
                }
            }
            catch {
            }
        }
        return this.resolveVersion("");
    }
    async ensureVersion(terminal, force, requiredVersion) {
        const current = await this.getCurrentVersion();
        if (!force && current !== "" && !requiredVersion) {
            return false;
        }
        let version = (requiredVersion !== null && requiredVersion !== void 0 ? requiredVersion : "latest").toLowerCase();
        if (!force && version === current) {
            return false;
        }
        const available = await this.loadAvailableVersions();
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
        await (0, utils_1.downloadFromBinaries)(terminal, this.path(), sourceName, {
            executable: this.isExecutable,
            adjustedPath: this.adjustedPath(),
            globally: this.runGlobally,
            version,
        });
        const info = {
            version: await this.resolveVersion(version),
        };
        (0, utils_1.writeJsonFile)(`${this.path()}.json`, info);
        return true;
    }
    static async ensureInstalledAll(terminal, components) {
        for (const component of Object.values(components)) {
            await component.ensureVersion(terminal, false);
        }
    }
    static async setVersions(terminal, force, components, versions) {
        let hasUpdates = false;
        for (const [name, component] of Object.entries(components)) {
            if (await component.ensureVersion(terminal, force, versions[name])) {
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            terminal.log(await this.getInfoAll(components));
        }
        else {
            terminal.log("All components already up to date.");
        }
    }
    static async updateAll(terminal, force, components) {
        const latest = {};
        for (const name of Object.keys(components)) {
            latest[name] = "latest";
        }
        await this.setVersions(terminal, force, components, latest);
    }
    static async getInfoAll(components) {
        const table = [["Component", "Version", "Available"]];
        let hasNotInstalledComponents = false;
        for (const [name, component] of Object.entries(components)) {
            const version = await component.getCurrentVersion();
            if (version === "") {
                hasNotInstalledComponents = true;
            }
            const allVersions = await component.loadAvailableVersions();
            table.push([
                name,
                version !== "" ? version : "not installed",
                (0, utils_1.ellipsisString)(allVersions)
            ]);
        }
        let info = (0, utils_1.formatTable)(table, { headerSeparator: true });
        if (hasNotInstalledComponents) {
            info += "\n\nMissing components will be automatically installed  on first demand.";
        }
        return info;
    }
}
exports.Component = Component;
//# sourceMappingURL=component.js.map