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
exports.components = void 0;
const os_1 = __importDefault(require("os"));
const core_1 = require("../../core");
const utils_1 = require("../../core/utils");
const TS4_PKG = "tonos-ts4";
const PYPI = `https://pypi.org/pypi/${TS4_PKG}/json`;
const currentOS = os_1.default.type();
const [PYTHON, PIP] = ["Linux", "Darwin"].includes(currentOS)
    ? ["python3", "pip3"]
    : ["python", "pip"];
exports.components = {
    ts4: new (class extends core_1.Component {
        getCurrentVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                let version;
                try {
                    const output = yield (0, utils_1.run)(PIP, ["show", TS4_PKG], {}, utils_1.nullTerminal);
                    version = output
                        .split(os_1.default.EOL)
                        .find(line => /^Version:/.exec(line));
                }
                catch (_a) {
                    // TODO handle the lack of 'pip'
                    console.debug(`Package ${TS4_PKG} not found`);
                }
                return version ? version.split(/:\s*/)[1] : "";
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
                const pkg = TS4_PKG + (version ? `==${version}` : "");
                const output = yield (0, utils_1.run)(PIP, ["install", "-U", pkg], {}, utils_1.nullTerminal);
                const successPattern = `Successfully installed ${TS4_PKG}-${version}`;
                const isOk = output
                    .split(os_1.default.EOL)
                    .find(line => line === successPattern);
                if (!isOk) {
                    terminal.writeError(output);
                    return false;
                }
                else {
                    terminal.log(successPattern);
                }
                return true;
            });
        }
        loadAvailableVersions() {
            return __awaiter(this, void 0, void 0, function* () {
                const info = yield (0, utils_1.httpsGetJson)(PYPI);
                const versions = Object.keys(info.releases)
                    .filter(v => /^(\d+\.){2}\d+$/.test(v))
                    .sort(utils_1.compareVersions)
                    .reverse();
                return versions;
            });
        }
    })("", PYTHON, {
        isExecutable: true,
        runGlobally: true,
    }),
};
//# sourceMappingURL=components.js.map