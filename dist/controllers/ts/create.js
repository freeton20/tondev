"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsCreateCommand = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../core/utils");
exports.tsCreateCommand = {
    name: "create",
    title: "Create Test",
    args: [{
            name: "folder",
            type: "folder",
        }],
    async run(terminal, args) {
        const testFilePath = (0, utils_1.uniqueFilePath)(path_1.default.dirname(args.file), (0, utils_1.changeExt)(path_1.default.basename(args.file), "{}.test.py"));
        terminal.log(`${testFilePath} has created for ${path_1.default.basename(args.file)}`);
    },
};
//# sourceMappingURL=create.js.map