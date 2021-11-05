"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.components = void 0;
const os = __importStar(require("os"));
const core_1 = require("../../core");
const p = os.platform();
let innerPath;
let targetName;
let ext;
if (p === "linux") {
    innerPath = "opt/work/llvm/install/bin/clang";
    targetName = "clang.tar";
    ext = p + ".tar.gz";
}
else if (p === "darwin") {
    innerPath = "bin/clang";
    targetName = "clang.zip";
    ext = p + ".zip";
}
else {
    innerPath = "bin/clang.exe";
    targetName = "clang.zip";
    ext = p + ".zip";
}
const TOOL_FOLDER_NAME = "clang";
exports.components = {
    compiler: new (class extends core_1.Component {
        getSourceName(version) {
            return `${this.name}/${this.name}-${version.split(".").join("_")}-${ext}`;
        }
        async resolveVersion(downloadedVersion) {
            return downloadedVersion;
        }
    })(TOOL_FOLDER_NAME, "clang-for-tvm", {
        targetName,
        innerPath,
        isExecutable: true,
    }),
};
//# sourceMappingURL=components.js.map