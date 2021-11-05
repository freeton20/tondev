"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDemo = exports.ensureDemoInstalled = exports.loadInfo = exports.getInfo = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("../../core");
const utils_1 = require("../../core/utils");
const demoBranch = "master";
const demoInfoURL = `https://raw.githubusercontent.com/tonlabs/sdk-samples/${demoBranch}/demo.json`;
const demoArchiveURL = `https://github.com/tonlabs/sdk-samples/archive/${demoBranch}.zip`;
const demoFolder = `sdk-samples-${demoBranch}`;
function jsHome() {
    return path_1.default.resolve((0, core_1.tondevHome)(), "js");
}
function demoHome() {
    return path_1.default.resolve(jsHome(), demoFolder);
}
function getInfo() {
    return JSON.parse(fs_extra_1.default.readFileSync(path_1.default.resolve(demoHome(), "demo.json")).toString());
}
exports.getInfo = getInfo;
async function loadInfo() {
    return (0, utils_1.httpsGetJson)(demoInfoURL);
}
exports.loadInfo = loadInfo;
async function ensureDemoInstalled(terminal) {
    if (fs_extra_1.default.pathExistsSync(demoHome())) {
        const info = getInfo();
        const remoteInfo = await loadInfo();
        if (info.version === remoteInfo.version) {
            return;
        }
        fs_extra_1.default.rmdirSync(demoHome(), { recursive: true });
    }
    if (!fs_extra_1.default.pathExistsSync(jsHome())) {
        fs_extra_1.default.mkdirSync(jsHome(), { recursive: true });
    }
    terminal.log("Downloading demo repository...");
    await (0, utils_1.downloadFromGithub)(terminal, demoArchiveURL, jsHome());
}
exports.ensureDemoInstalled = ensureDemoInstalled;
async function downloadDemo(terminal, name, folder) {
    await ensureDemoInstalled(terminal);
    const info = getInfo();
    const app = info.applications.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!app) {
        throw new Error(`Demo "${name} not found.`);
    }
    const dstPath = path_1.default.resolve(folder, name);
    if (fs_extra_1.default.existsSync(dstPath)) {
        terminal.log(`This demo already downloaded in: ${dstPath}`);
        return;
    }
    fs_extra_1.default.copySync(path_1.default.resolve(demoHome(), app.path), dstPath);
    terminal.log(`
Demo ${name} is downloaded into ${dstPath}
Check README.md or run application:
$ cd ${path_1.default.relative(".", dstPath)}
$ npm i
$ npm start
`);
}
exports.downloadDemo = downloadDemo;
//# sourceMappingURL=installer.js.map