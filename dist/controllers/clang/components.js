"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
            return `${this.name}/${this.name}-${version
                .split(".")
                .join("_")}-${ext}`;
        }
        resolveVersion(downloadedVersion) {
            return __awaiter(this, void 0, void 0, function* () {
                return downloadedVersion;
            });
        }
    })(TOOL_FOLDER_NAME, "clang-for-tvm", {
        targetName,
        innerPath,
        isExecutable: true,
    }),
};
//# sourceMappingURL=components.js.map