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
exports.Contract = exports.contractDecodeTvcCommand = exports.contractDecodeAccountDataCommand = exports.contractRunExecutorCommand = exports.contractRunLocalCommand = exports.contractRunCommand = exports.contractTopUpCommand = exports.contractDeployCommand = exports.contractInfoCommand = void 0;
const utils_1 = require("../../core/utils");
const appkit_1 = require("@eversdk/appkit");
const core_1 = require("@eversdk/core");
const accounts_1 = require("./accounts");
const run_1 = require("./run");
const giver_1 = require("../network/giver");
const registry_1 = require("../network/registry");
const utils_2 = require("../../core/utils");
const abiFileArg = {
    isArg: true,
    name: "file",
    title: "ABI file",
    type: "file",
    nameRegExp: /\.abi$/i,
};
const tvcFileArg = {
    isArg: true,
    name: "file",
    title: "TVC file",
    type: "file",
    nameRegExp: /\.tvc$/i,
};
const infoFileArg = Object.assign(Object.assign({}, abiFileArg), { defaultValue: "" });
const networkOpt = {
    name: "network",
    alias: "n",
    type: "string",
    title: "Network name",
    defaultValue: "",
};
const signerOpt = {
    name: "signer",
    alias: "s",
    title: "Signer key name",
    type: "string",
    defaultValue: "",
};
const runSignerOpt = {
    name: "run-signer",
    title: "Signer key name",
    description: "This signer will be used to sing message. " +
        "If run signer is not specified then contract's signer is used",
    type: "string",
    defaultValue: "",
};
const addressOpt = {
    name: "address",
    alias: "a",
    title: "Account address",
    type: "string",
    defaultValue: "",
};
const functionArg = {
    isArg: true,
    name: "function",
    title: "Function name",
    type: "string",
    defaultValue: "",
};
const inputOpt = {
    name: "input",
    alias: "i",
    title: "Function parameters as name:value,...",
    description: "Array values must be specified as [item,...]. " +
        'Spaces are not allowed. If value contains spaces or special symbols "[],:" ' +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
};
const dataOpt = {
    name: "data",
    alias: "d",
    title: "Deploying initial data as name:value,...",
    description: "This data is required to calculate the account address and to deploy contract.\n" +
        "Array values must be specified as [item,...]. " +
        'Spaces are not allowed. If value contains spaces or special symbols "[],:" ' +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
};
const valueOpt = {
    name: "value",
    alias: "v",
    title: "Deploying balance value in nano tokens",
    type: "string",
    defaultValue: "",
};
const preventUiOpt = {
    name: "prevent-ui",
    alias: "p",
    title: "Prevent user interaction",
    description: "Useful in shell scripting e.g. on server or in some automating to disable " +
        "waiting for the user input.\n" +
        "Instead everdev will abort with error.\n" +
        "For example when some parameters are missing in command line " +
        "then everdev will prompt user to input values for missing parameters " +
        "(or fails if prevent-ui option is specified).",
    type: "boolean",
    defaultValue: "false",
};
exports.contractInfoCommand = {
    name: "info",
    alias: "i",
    title: "Prints contract summary",
    args: [infoFileArg, networkOpt, signerOpt, dataOpt, addressOpt],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.file === "" && args.address === "") {
                throw new Error("File argument or address option must be specified");
            }
            const account = yield (0, accounts_1.getAccount)(terminal, args);
            const parsed = yield account.getAccount();
            const accType = parsed.acc_type;
            if (account.contract.tvc) {
                const boc = account.client.boc;
                const codeHash = (yield boc.get_boc_hash({
                    boc: (yield boc.get_code_from_tvc({
                        tvc: account.contract.tvc,
                    })).code,
                })).hash;
                terminal.log(`Code Hash: ${codeHash} (from TVC file)`);
            }
            if (accType === appkit_1.AccountType.nonExist) {
                terminal.log("Account:   Doesn't exist");
            }
            else {
                terminal.log(`Account:   ${parsed.acc_type_name}`);
                terminal.log(`Balance:   ${(0, utils_2.formatTokens)(parsed.balance)}`);
                parsed.boc = (0, utils_2.reduceBase64String)(parsed.boc);
                parsed.code = (0, utils_2.reduceBase64String)(parsed.code);
                parsed.data = (0, utils_2.reduceBase64String)(parsed.data);
                terminal.log(`Details:   ${JSON.stringify(parsed, undefined, "    ")}`);
            }
            yield account.free();
            account.client.close();
        });
    },
};
exports.contractDeployCommand = {
    name: "deploy",
    alias: "d",
    title: "Deploy contract to network",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        functionArg,
        inputOpt,
        dataOpt,
        valueOpt,
        preventUiOpt,
    ],
    run(terminal, args) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield (0, accounts_1.getAccount)(terminal, args);
            const info = yield account.getAccount();
            let accountAddress = yield account.getAddress();
            const dataParams = (_a = account.contract.abi.data) !== null && _a !== void 0 ? _a : [];
            if (dataParams.length > 0) {
                const initData = yield (0, run_1.resolveParams)(terminal, `\nDeploying initial data:\n`, dataParams, (_b = args.data) !== null && _b !== void 0 ? _b : "", args.preventUi);
                yield account.free();
                account = new appkit_1.Account(account.contract, {
                    client: account.client,
                    signer: account.signer,
                    initData,
                });
                accountAddress = yield account.getAddress();
            }
            if (info.acc_type === appkit_1.AccountType.active) {
                throw new Error(`Account ${accountAddress} already deployed.`);
            }
            const { giver: giverInfo, name: networkName } = new registry_1.NetworkRegistry().get(args.network);
            const topUpValue = (0, utils_2.parseNanoTokens)(args.value);
            if (topUpValue) {
                if (giverInfo) {
                    const giver = yield giver_1.NetworkGiver.create(account.client, giverInfo);
                    giver.value = topUpValue;
                    yield giver.sendTo(accountAddress, topUpValue);
                    yield giver.account.free();
                }
                else {
                    throw new Error(`A top-up was requested, but giver is not configured for the network ${networkName}\n` +
                        `You have to set up a giver for this network with \`everdev network giver\` command.`);
                }
            }
            const initFunctionName = args.function.toLowerCase() === "none"
                ? ""
                : args.function || "constructor";
            const initFunction = (_c = account.contract.abi.functions) === null || _c === void 0 ? void 0 : _c.find(x => x.name === initFunctionName);
            const initInput = yield (0, run_1.resolveParams)(terminal, "\nParameters of constructor:\n", (_d = initFunction === null || initFunction === void 0 ? void 0 : initFunction.inputs) !== null && _d !== void 0 ? _d : [], args.input, args.preventUi);
            terminal.log("\nDeploying...");
            try {
                yield account.deploy({
                    initFunctionName: initFunction === null || initFunction === void 0 ? void 0 : initFunction.name,
                    initInput,
                });
            }
            catch (err) {
                const isLowBalance = [407, 409].includes((_f = (_e = err === null || err === void 0 ? void 0 : err.data) === null || _e === void 0 ? void 0 : _e.local_error) === null || _f === void 0 ? void 0 : _f.code) /* low balance on real network */ ||
                    ([407, 409].includes(err.code) &&
                        ((_g = err.data) === null || _g === void 0 ? void 0 : _g.local_error) ===
                            undefined); /* low balance on node se */
                throw isLowBalance
                    ? new Error(`Account ${accountAddress} has low balance to deploy.\n` +
                        (topUpValue
                            ? `You sent amount which is too small`
                            : (giverInfo === null || giverInfo === void 0 ? void 0 : giverInfo.signer)
                                ? `You can use \`everdev contract deploy <file> -v <value>\` command to top it up`
                                : `You have to provide enough balance before deploying in two ways: \n` +
                                    `sending some value to this address\n` +
                                    `or setting up a giver for the network with \`everdev network giver\` command.`))
                    : err;
            }
            terminal.log(`Contract is deployed at address: ${accountAddress}`);
            yield account.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractTopUpCommand = {
    name: "topup",
    alias: "t",
    title: "Top up account from giver",
    args: [infoFileArg, addressOpt, networkOpt, signerOpt, dataOpt, valueOpt],
    run(terminal, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (args.file === "" && args.address === "") {
                throw new Error("File argument or address option must be specified");
            }
            const account = yield (0, accounts_1.getAccount)(terminal, args);
            const network = new registry_1.NetworkRegistry().get(args.network);
            const networkGiverInfo = network.giver;
            if (!networkGiverInfo) {
                throw new Error(`Missing giver for the network ${network.name}.\n` +
                    `You have to set up a giver for this network with \`everdev network giver\` command.`);
            }
            const giver = yield giver_1.NetworkGiver.create(account.client, networkGiverInfo);
            const value = (_a = (0, utils_2.parseNanoTokens)(args.value)) !== null && _a !== void 0 ? _a : giver.value;
            if (!value) {
                throw new Error(`Missing top-up value.\n` +
                    `You must specify a value with the option \`-v\` or\n` +
                    `set the default value for the giver with \`everdev network giver\` command.`);
            }
            giver.value = value;
            yield giver.sendTo(yield account.getAddress(), value);
            terminal.log(`${(0, utils_2.formatTokens)(giver.value)} were sent to address ${yield account.getAddress()}`);
            yield giver.account.free();
            yield account.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractRunCommand = {
    name: "run",
    alias: "r",
    title: "Run contract deployed on the network",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield (0, accounts_1.getAccount)(terminal, args);
            const { functionName, functionInput, signer } = yield (0, run_1.getRunParams)(terminal, account, args);
            terminal.log("\nRunning...");
            const result = yield account.run(functionName, functionInput, {
                signer,
            });
            yield (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
            yield account.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractRunLocalCommand = {
    name: "run-local",
    alias: "l",
    title: "Run contract locally on TVM",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield (0, accounts_1.getAccount)(terminal, args);
            yield guardAccountIsActive(account);
            const { functionName, functionInput } = yield (0, run_1.getRunParams)(terminal, account, args);
            const accountWithoutSigner = new appkit_1.Account(account.contract, {
                client: account.client,
                address: yield account.getAddress(),
            });
            const result = yield accountWithoutSigner.runLocal(functionName, functionInput, {});
            yield (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
            yield account.free();
            yield accountWithoutSigner.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractRunExecutorCommand = {
    name: "run-executor",
    alias: "e",
    title: "Emulate transaction executor locally on TVM",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield (0, accounts_1.getAccount)(terminal, args);
            const { functionName, functionInput } = yield (0, run_1.getRunParams)(terminal, account, args);
            const result = yield account.runLocal(functionName, functionInput, {
                performAllChecks: true,
            });
            yield (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
            yield account.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractDecodeAccountDataCommand = {
    name: "decode-data",
    alias: "dd",
    title: "Decode data from a contract deployed on the network",
    args: [abiFileArg, networkOpt, addressOpt],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.file === "" && args.address === "") {
                throw new Error("File argument or address option must be specified");
            }
            const { abi } = (0, utils_1.resolveContract)(args.file).package;
            if (abi.version === undefined || abi.version < "2.1") {
                throw new Error("This feature requires ABI 2.1 or higher");
            }
            const account = yield (0, accounts_1.getAccount)(terminal, Object.assign(Object.assign({}, args), { signer: "" }));
            yield guardAccountIsActive(account);
            const { data } = yield account.getAccount();
            const decoded = yield account.client.abi.decode_account_data({
                abi: {
                    type: "Contract",
                    value: abi,
                },
                data,
            });
            terminal.log(`Decoded account data: ${JSON.stringify(decoded, undefined, 4)}`);
            yield account.free();
            account.client.close();
            core_1.TonClient.default.close();
        });
    },
};
exports.contractDecodeTvcCommand = {
    name: "decode-tvc",
    alias: "dt",
    title: "Decode tvc into code, data, libraries and special options",
    args: [tvcFileArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = yield core_1.TonClient.default.boc.decode_tvc({
                tvc: (0, utils_1.resolveTvcAsBase64)(args.file),
            });
            terminal.log(`Decoded TVC: ${JSON.stringify(decoded, undefined, 4)}`);
        });
    },
};
const guardAccountIsActive = (acc) => __awaiter(void 0, void 0, void 0, function* () {
    const { active, uninit, frozen } = appkit_1.AccountType;
    const { acc_type: accType } = yield acc.getAccount();
    if (accType === active) {
        return;
    }
    const status = accType === uninit
        ? "is not initialized"
        : accType === frozen
            ? "is frozen"
            : "does not exist";
    throw Error(`Account ${yield acc.getAddress()} ${status}`);
});
exports.Contract = {
    name: "contract",
    alias: "c",
    title: "Smart Contracts",
    commands: [
        exports.contractInfoCommand,
        exports.contractDecodeAccountDataCommand,
        exports.contractDecodeTvcCommand,
        exports.contractTopUpCommand,
        exports.contractDeployCommand,
        exports.contractRunCommand,
        exports.contractRunLocalCommand,
        exports.contractRunExecutorCommand,
    ],
};
//# sourceMappingURL=index.js.map