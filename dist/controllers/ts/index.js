"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuite = void 0;
const create_1 = require("./create");
const run_1 = require("./run");
const inspect_1 = require("./inspect");
exports.TestSuite = {
    name: "ts",
    title: "Smart Contract Test Suite",
    commands: [create_1.tsCreateCommand, run_1.tsRunCommand, inspect_1.tsInspectCommand],
};
//# sourceMappingURL=index.js.map