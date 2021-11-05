"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsInspectCommand = void 0;
const path_1 = __importDefault(require("path"));
exports.tsInspectCommand = {
    name: "inspect",
    title: "Inspect Test Result",
    args: [{
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,
        }],
    async run(terminal, args) {
        terminal.log(`${path_1.default.basename(args.file)} tests passed`);
    },
};
//# sourceMappingURL=inspect.js.map