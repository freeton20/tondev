"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRunResult = exports.getRunParams = exports.resolveParams = exports.resolveFunction = void 0;
const core_1 = require("@tonclient/core");
const param_parser_1 = require("./param-parser");
const registry_1 = require("../signer/registry");
async function resolveFunction(terminal, account, functionName, preventUi) {
    var _a, _b;
    const functions = (_a = account.contract.abi.functions) !== null && _a !== void 0 ? _a : [];
    functionName = functionName.trim();
    while (functionName === "" && !preventUi) {
        terminal.log("\nAvailable functions:\n");
        functions.forEach((x, i) => terminal.log(`  ${i + 1}) ${x.name}`));
        terminal.log();
        const functionIndex = Number.parseInt(await inputParam(terminal, {
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
}
exports.resolveFunction = resolveFunction;
function inputLine(terminal, prompt) {
    terminal.write(`  ${prompt}: `);
    return new Promise((resolve) => {
        const standard_input = process.stdin;
        standard_input.setEncoding("utf-8");
        standard_input.once("data", function (data) {
            resolve(`${data}`.trim());
        });
    });
}
async function inputScalar(terminal, param) {
    while (true) {
        const value = await inputLine(terminal, `${param.name} (${param.type})`);
        try {
            return param_parser_1.ParamParser.scalar(param, `"${value}"`);
        }
        catch (err) {
            terminal.log(err.toString());
        }
    }
}
async function inputArray(terminal, param) {
    const item = JSON.parse(JSON.stringify(param));
    item.type = param.type.slice(0, -2);
    let count = Number(await inputLine(terminal, `Enter number of items in ${param.name}`));
    const items = [];
    let i = 1;
    while (i <= count) {
        item.name = `${param.name} ${i}`;
        items.push(await inputParam(terminal, item));
        i += 1;
    }
    return items;
}
async function inputParam(terminal, param) {
    if (param.type.endsWith("[]")) {
        return inputArray(terminal, param);
    }
    else {
        return inputScalar(terminal, param);
    }
}
async function resolveParams(terminal, prompt, params, paramsString, preventUi) {
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
            values[param.name] = await inputParam(terminal, param);
        }
    }
    return values;
}
exports.resolveParams = resolveParams;
async function getRunParams(terminal, account, args) {
    const func = await resolveFunction(terminal, account, args.function, args.preventUi);
    const functionInput = await resolveParams(terminal, `\nParameters of ${func.name}:\n`, func.inputs, args.input, args.preventUi);
    const signers = new registry_1.SignerRegistry();
    const signer = args.runSigner.trim() !== ""
        ? await signers.resolveSigner(args.runSigner, { useNoneForEmptyName: false })
        : account.signer;
    return {
        functionName: func.name,
        functionInput,
        signer,
    };
}
exports.getRunParams = getRunParams;
async function logRunResult(terminal, decoded, transaction) {
    var _a;
    const outMessages = (_a = decoded === null || decoded === void 0 ? void 0 : decoded.out_messages) !== null && _a !== void 0 ? _a : [];
    const details = {
        transaction,
        output: decoded === null || decoded === void 0 ? void 0 : decoded.output,
        out_messages: outMessages.filter(x => (x === null || x === void 0 ? void 0 : x.body_type) !== core_1.MessageBodyType.Output),
    };
    terminal.log();
    terminal.log(`Execution has finished with result: ${JSON.stringify(details, undefined, "    ")}`);
}
exports.logRunResult = logRunResult;
//# sourceMappingURL=run.js.map