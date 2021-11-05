"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doneTests = exports.initTests = exports.writeTempJson = exports.copyToTemp = exports.writeTempText = exports.tempFolder = void 0;
const __1 = require("..");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
jest.setTimeout(100000);
test("init", () => {
});
function tempFolder() {
    const temp = path_1.default.resolve((0, __1.tondevHome)(), "_temp");
    if (!fs_1.default.existsSync(temp)) {
        fs_1.default.mkdirSync(temp, { recursive: true });
    }
    return temp;
}
exports.tempFolder = tempFolder;
function writeTempText(name, text) {
    const filePath = path_1.default.resolve(tempFolder(), name);
    (0, __1.writeTextFile)(filePath, text);
    return filePath;
}
exports.writeTempText = writeTempText;
function copyToTemp(source) {
    const filePath = path_1.default.resolve(tempFolder(), path_1.default.basename(source));
    fs_1.default.copyFileSync(source, filePath);
    return filePath;
}
exports.copyToTemp = copyToTemp;
function writeTempJson(name, json) {
    return writeTempText(name, JSON.stringify(json, undefined, "    "));
}
exports.writeTempJson = writeTempJson;
function deleteFiles(files) {
    files.forEach((file) => {
        if (fs_1.default.existsSync(file)) {
            fs_1.default.unlinkSync(file);
        }
    });
}
function initTests() {
    const home = path_1.default.resolve(os_1.default.homedir(), ".tondev_test");
    (0, __1.tondevInit)({
        home,
    });
    deleteFolderRecursive(path_1.default.resolve(home, "_temp"));
    deleteFiles([
        path_1.default.resolve(home, "signer", "registry.json"),
        path_1.default.resolve(home, "network", "registry.json"),
        path_1.default.resolve(home, "se", "config.json"),
    ]);
}
exports.initTests = initTests;
function doneTests() {
    (0, __1.tondevDone)();
}
exports.doneTests = doneTests;
function deleteFolderRecursive(directoryPath) {
    if (fs_1.default.existsSync(directoryPath)) {
        fs_1.default.readdirSync(directoryPath).forEach((file) => {
            const curPath = path_1.default.join(directoryPath, file);
            if (fs_1.default.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            }
            else {
                fs_1.default.unlinkSync(curPath);
            }
        });
        fs_1.default.rmdirSync(directoryPath);
    }
}
//# sourceMappingURL=init.js.map