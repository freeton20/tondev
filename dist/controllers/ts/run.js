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
exports.tsRunCommand = void 0;
const path_1 = __importDefault(require("path"));
exports.tsRunCommand = {
    name: "run",
    title: "Run Test",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            terminal.log(`${path_1.default.basename(args.file)} test passed`);
        });
    },
};
//# sourceMappingURL=run.js.map