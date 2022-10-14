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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRunResult = exports.getRunParams = exports.resolveParams = exports.resolveFunction = void 0;
const core_1 = require("@eversdk/core");
const param_parser_1 = require("./param-parser");
const registry_1 = require("../signer/registry");
function resolveFunction(terminal, account, functionName, preventUi) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const functions = (_a = account.contract.abi.functions) !== null && _a !== void 0 ? _a : [];
        functionName = functionName.trim();
        while (functionName === "" && !preventUi) {
            terminal.log("\nAvailable functions:\n");
            functions.forEach((x, i) => terminal.log(`  ${i + 1}) ${x.name}`));
            terminal.log();
            const functionIndex = Number.parseInt(yield inputParam(terminal, {
                name: "Select function",
                type: "number",
            })) - 1;
            if (functionIndex >= 0 && functionIndex < functions.length) {
                return functions[functionIndex];
            }
            terminal.log("Invalid function number. Try again.");
        }
        if (functionName === "") {
            throw new Error("Function name isn't specified");
        }
        const func = (_b = account.contract.abi.functions) === null || _b === void 0 ? void 0 : _b.find(x => x.name === functionName);
        if (!func) {
            throw new Error(`Function not found: ${functionName}`);
        }
        return func;
    });
}
exports.resolveFunction = resolveFunction;
function inputLine(terminal, prompt) {
    terminal.write(`  ${prompt}: `);
    return new Promise(resolve => {
        const standard_input = process.stdin;
        standard_input.setEncoding("utf-8");
        // SO: https://stackoverflow.com/questions/54182732/process-never-ends-when-using-process-stdin-once
        standard_input.resume();
        standard_input.once("data", function (data) {
            standard_input.pause();
            resolve(`${data}`.trim());
        });
    });
}
function inputTuple(terminal, param) {
    return __awaiter(this, void 0, void 0, function* () {
        for (;;) {
            const value = yield inputLine(terminal, `${param.name} (${param.type})`);
            try {
                return JSON.parse(value);
            }
            catch (err) {
                terminal.log(err.toString());
            }
        }
    });
}
function inputScalar(terminal, param) {
    return __awaiter(this, void 0, void 0, function* () {
        for (;;) {
            const value = yield inputLine(terminal, `${param.name} (${param.type})`);
            try {
                return param_parser_1.ParamParser.scalar(param, `"${value}"`);
            }
            catch (err) {
                terminal.log(err.toString());
            }
        }
    });
}
function inputArray(terminal, param) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = JSON.parse(JSON.stringify(param));
        item.type = param.type.slice(0, -2);
        const count = Number(yield inputLine(terminal, `Enter number of items in ${param.name}`));
        const items = [];
        let i = 1;
        while (i <= count) {
            item.name = `${param.name} ${i}`;
            items.push(yield inputParam(terminal, item));
            i += 1;
        }
        return items;
    });
}
function inputParam(terminal, param) {
    return __awaiter(this, void 0, void 0, function* () {
        if (param.type.endsWith("[]")) {
            return inputArray(terminal, param);
        }
        else if (param.type.endsWith("tuple")) {
            return inputTuple(terminal, param);
        }
        else {
            return inputScalar(terminal, param);
        }
    });
}
function resolveParams(terminal, prompt, params, paramsString, preventUi) {
    return __awaiter(this, void 0, void 0, function* () {
        if (paramsString.match(/{.+}/)) {
            let jsonArgs;
            try {
                jsonArgs = JSON.parse(paramsString);
            }
            catch (err) {
                throw new Error(`Malformed JSON object has been passed`);
            }
            terminal.log(`Skip ABI validation step because a JSON object has been passed as an argument.`);
            return jsonArgs;
        }
        const values = param_parser_1.ParamParser.components({
            name: "params",
            type: "tuple",
            components: params,
        }, paramsString);
        let hasUserInput = false;
        if (params.length > 0) {
            terminal.log(prompt);
        }
        for (const param of params) {
            if (param.name in values) {
                terminal.log(`  ${param.name} (${param.type}): ${JSON.stringify(values[param.name])}`);
            }
        }
        for (const param of params) {
            if (!(param.name in values)) {
                if (!hasUserInput) {
                    if (preventUi) {
                        throw new Error(`Missing parameter "${param.name}".`);
                    }
                    hasUserInput = true;
                }
                values[param.name] = yield inputParam(terminal, param);
            }
        }
        return values;
    });
}
exports.resolveParams = resolveParams;
function getRunParams(terminal, account, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const func = yield resolveFunction(terminal, account, args.function, args.preventUi);
        const functionInput = yield resolveParams(terminal, `\nParameters of ${func.name}:\n`, func.inputs, args.input, args.preventUi);
        const signers = new registry_1.SignerRegistry();
        const signer = args.runSigner.trim() !== ""
            ? yield signers.resolveSigner(args.runSigner, {
                useNoneForEmptyName: false,
            })
            : account.signer;
        return {
            functionName: func.name,
            functionInput,
            signer,
        };
    });
}
exports.getRunParams = getRunParams;
function logRunResult(terminal, decoded, transaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const outMessages = (_a = decoded === null || decoded === void 0 ? void 0 : decoded.out_messages) !== null && _a !== void 0 ? _a : [];
        const details = {
            transaction,
            output: decoded === null || decoded === void 0 ? void 0 : decoded.output,
            out_messages: outMessages.filter(x => (x === null || x === void 0 ? void 0 : x.body_type) !== core_1.MessageBodyType.Output),
        };
        terminal.log();
        terminal.log("Execution has finished with result:");
        terminal.log(JSON.stringify(details, undefined, "    "));
    });
}
exports.logRunResult = logRunResult;
//# sourceMappingURL=run.js.map