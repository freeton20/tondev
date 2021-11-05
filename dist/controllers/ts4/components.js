"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.components = void 0;
const os_1 = __importDefault(require("os"));
const core_1 = require("../../core");
const utils_1 = require("../../core/utils");
const TS4_PKG = 'tonos-ts4';
const PYPI = `https://pypi.org/pypi/${TS4_PKG}/json`;
const currentOS = os_1.default.type();
const [PYTHON, PIP] = ['Linux', 'Darwin'].includes(currentOS)
    ? ['python3', 'pip3']
    : ['python', 'pip'];
exports.components = {
    ts4: new class extends core_1.Component {
        async getCurrentVersion() {
            let version;
            try {
                const output = await (0, utils_1.run)(PIP, ['show', TS4_PKG], {}, utils_1.nullTerminal);
                version = output.split(os_1.default.EOL).find(line => (/^Version:/).exec(line));
            }
            catch {
                // TODO handle the lack of 'pip'
                console.debug(`Package ${TS4_PKG} not found`);
            }
            return version ? version.split(/:\s*/)[1] : '';
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
            const pkg = TS4_PKG + (version ? `==${version}` : '');
            const output = await (0, utils_1.run)(PIP, ['install', '-U', pkg], {}, utils_1.nullTerminal);
            const successPattern = `Successfully installed ${TS4_PKG}-${version}`;
            const isOk = output.split(os_1.default.EOL).find(line => line === successPattern);
            if (!isOk) {
                terminal.writeError(output);
                return false;
            }
            else {
                terminal.log(successPattern);
            }
            return true;
        }
        async loadAvailableVersions() {
            const info = await (0, utils_1.httpsGetJson)(PYPI);
            const versions = Object.keys(info.releases)
                .filter(v => (/^(\d+\.){2}\d+$/).test(v))
                .sort(utils_1.compareVersions)
                .reverse();
            return versions;
        }
    }('', PYTHON, {
        isExecutable: true,
        runGlobally: true,
    }),
};
//# sourceMappingURL=components.js.map