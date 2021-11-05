"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
const __1 = require("..");
const path_1 = __importDefault(require("path"));
beforeAll(init_1.initTests);
afterAll(init_1.doneTests);
test("Hide linker output", async () => {
    await (0, __1.runCommand)(__1.consoleTerminal, "sol update", {});
    const terminal = new __1.StringTerminal();
    const solPath = (0, init_1.copyToTemp)(path_1.default.resolve(__dirname, "..", "..", "contracts", "HelloWallet.sol"));
    await (0, __1.runCommand)(terminal, "sol compile", {
        file: solPath,
    });
    expect(terminal.stdout.trim()).toEqual("");
});
//# sourceMappingURL=sol.js.map