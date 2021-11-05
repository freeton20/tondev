"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.contractRunExecutorCommand = exports.contractRunLocalCommand = exports.contractRunCommand = exports.contractTopUpCommand = exports.contractDeployCommand = exports.contractInfoCommand = void 0;
const appkit_1 = require("@tonclient/appkit");
const core_1 = require("@tonclient/core");
const accounts_1 = require("./accounts");
const run_1 = require("./run");
const giver_1 = require("../network/giver");
const registry_1 = require("../network/registry");
const utils_1 = require("../../core/utils");
const fileArg = {
    isArg: true,
    name: "file",
    title: "ABI file",
    type: "file",
    nameRegExp: /\.abi$/i,
};
const infoFileArg = {
    ...fileArg,
    defaultValue: "",
};
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
        "Spaces are not allowed. If value contains spaces or special symbols \"[],:\" " +
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
        "Spaces are not allowed. If value contains spaces or special symbols \"[],:\" " +
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
        "Instead tondev will abort with error.\n" +
        "For example when some parameters are missing in command line " +
        "then ton dev will prompt user to input values for missing parameters " +
        "(or fails if prevent-ui option is specified).",
    type: "boolean",
    defaultValue: "false",
};
exports.contractInfoCommand = {
    name: "info",
    alias: "i",
    title: "Prints contract summary",
    args: [
        infoFileArg,
        networkOpt,
        signerOpt,
        dataOpt,
        addressOpt,
    ],
    async run(terminal, args) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified");
        }
        const account = await (0, accounts_1.getAccount)(terminal, args);
        const parsed = await account.getAccount();
        const accType = parsed.acc_type;
        if (account.contract.tvc) {
            const boc = account.client.boc;
            const codeHash = (await boc.get_boc_hash({
                boc: (await boc.get_code_from_tvc({ tvc: account.contract.tvc })).code,
            })).hash;
            terminal.log(`Code Hash: ${codeHash} (from TVC file)`);
        }
        if (accType === appkit_1.AccountType.nonExist) {
            terminal.log("Account:   Doesn't exist");
        }
        else {
            terminal.log(`Account:   ${parsed.acc_type_name}`);
            terminal.log(`Balance:   ${(0, utils_1.formatTokens)(parsed.balance)}`);
            parsed.boc = (0, utils_1.reduceBase64String)(parsed.boc);
            parsed.code = (0, utils_1.reduceBase64String)(parsed.code);
            parsed.data = (0, utils_1.reduceBase64String)(parsed.data);
            terminal.log(`Details:   ${JSON.stringify(parsed, undefined, "    ")}`);
        }
        await account.free();
        account.client.close();
    },
};
exports.contractDeployCommand = {
    name: "deploy",
    alias: "d",
    title: "Deploy contract to network",
    args: [
        fileArg,
        networkOpt,
        signerOpt,
        functionArg,
        inputOpt,
        dataOpt,
        valueOpt,
        preventUiOpt,
    ],
    async run(terminal, args) {
        var _a, _b, _c, _d, _e, _f, _g;
        let account = await (0, accounts_1.getAccount)(terminal, args);
        const info = await account.getAccount();
        const accountAddress = await account.getAddress();
        if (info.acc_type === appkit_1.AccountType.active) {
            throw new Error(`Account ${accountAddress} already deployed.`);
        }
        const { giver: giverInfo, name: networkName } = new registry_1.NetworkRegistry().get(args.network);
        const topUpValue = (0, utils_1.parseNanoTokens)(args.value);
        if (topUpValue) {
            if (giverInfo) {
                const giver = await giver_1.NetworkGiver.create(account.client, giverInfo);
                giver.value = topUpValue;
                await giver.sendTo(accountAddress, topUpValue);
                await giver.account.free();
            }
            else {
                throw new Error(`A top-up was requested, but giver is not configured for the network ${networkName} was found.\n` +
                    `You have to set up a giver for this network with \`tondev network giver\` command.`);
            }
        }
        const dataParams = (_a = account.contract.abi.data) !== null && _a !== void 0 ? _a : [];
        if (dataParams.length > 0) {
            const initData = await (0, run_1.resolveParams)(terminal, `\nDeploying initial data:\n`, dataParams, (_b = args.data) !== null && _b !== void 0 ? _b : "", args.preventUi);
            await account.free();
            account = new appkit_1.Account(account.contract, {
                client: account.client,
                address: await accountAddress,
                signer: account.signer,
                initData,
            });
        }
        const initFunctionName = args.function.toLowerCase() === "none" ? "" : (args.function || "constructor");
        const initFunction = (_c = account.contract.abi.functions) === null || _c === void 0 ? void 0 : _c.find(x => x.name === initFunctionName);
        const initInput = await (0, run_1.resolveParams)(terminal, "\nParameters of constructor:\n", (_d = initFunction === null || initFunction === void 0 ? void 0 : initFunction.inputs) !== null && _d !== void 0 ? _d : [], args.input, args.preventUi);
        terminal.log("\nDeploying...");
        try {
            await account.deploy({
                initFunctionName: initFunction === null || initFunction === void 0 ? void 0 : initFunction.name,
                initInput,
            });
        }
        catch (err) {
            const isLowBalance = ([407, 409].includes((_f = (_e = err === null || err === void 0 ? void 0 : err.data) === null || _e === void 0 ? void 0 : _e.local_error) === null || _f === void 0 ? void 0 : _f.code)) /* low balance on real network */ ||
                ([407, 409].includes(err.code) && ((_g = err.data) === null || _g === void 0 ? void 0 : _g.local_error) === undefined); /* low balance on node se */
            throw isLowBalance
                ? new Error(`Account ${accountAddress} has low balance to deploy.\n` +
                    (topUpValue
                        ? `You sent amount which is too small`
                        : (giverInfo === null || giverInfo === void 0 ? void 0 : giverInfo.signer)
                            ? `You can use \`tondev contract deploy <file> -v <value>\` command to top it up`
                            : `You have to provide enough balance before deploying in two ways: \n` +
                                `sending some value to this address\n` +
                                `or setting up a giver for the network with \`tondev network giver\` command.`))
                : err;
        }
        terminal.log(`Contract is deployed at address: ${accountAddress}`);
        await account.free();
        account.client.close();
        core_1.TonClient.default.close();
        process.exit(0);
    },
};
exports.contractTopUpCommand = {
    name: "topup",
    alias: "t",
    title: "Top up account from giver",
    args: [
        infoFileArg,
        addressOpt,
        networkOpt,
        signerOpt,
        dataOpt,
        valueOpt,
    ],
    async run(terminal, args) {
        var _a;
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified");
        }
        const account = await (0, accounts_1.getAccount)(terminal, args);
        const network = new registry_1.NetworkRegistry().get(args.network);
        const networkGiverInfo = network.giver;
        if (!networkGiverInfo) {
            throw new Error(`Missing giver for the network ${network.name}.\n` +
                `You have to set up a giver for this network with \`tondev network giver\` command.`);
        }
        const giver = await giver_1.NetworkGiver.create(account.client, networkGiverInfo);
        const value = (_a = (0, utils_1.parseNanoTokens)(args.value)) !== null && _a !== void 0 ? _a : giver.value;
        if (!value) {
            throw new Error(`Missing top-up value.\n` +
                `You must specify a value with the option \`-v\` or\n` +
                `set the default value for the giver with \`tondev network giver\` command.`);
        }
        giver.value = value;
        await giver.sendTo(await account.getAddress(), value);
        terminal.log(`${(0, utils_1.formatTokens)(giver.value)} were sent to address ${await account.getAddress()}`);
        await giver.account.free();
        await account.free();
        account.client.close();
        core_1.TonClient.default.close();
        process.exit(0);
    },
};
exports.contractRunCommand = {
    name: "run",
    alias: "r",
    title: "Run contract deployed on the network",
    args: [
        fileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal, args) {
        const account = await (0, accounts_1.getAccount)(terminal, args);
        const { functionName, functionInput, signer, } = await (0, run_1.getRunParams)(terminal, account, args);
        terminal.log("\nRunning...");
        const result = await account.run(functionName, functionInput, {
            signer
        });
        await (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
        await account.free();
        account.client.close();
        core_1.TonClient.default.close();
        process.exit(0);
    },
};
exports.contractRunLocalCommand = {
    name: "run-local",
    alias: "l",
    title: "Run contract locally on TVM",
    args: [
        fileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal, args) {
        const account = await (0, accounts_1.getAccount)(terminal, args);
        await guardAccountIsActive(account);
        const { functionName, functionInput, } = await (0, run_1.getRunParams)(terminal, account, args);
        const accountWithoutSigner = new appkit_1.Account(account.contract, {
            client: account.client,
            address: await account.getAddress(),
        });
        const result = await accountWithoutSigner.runLocal(functionName, functionInput, {});
        await (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
        await account.free();
        await accountWithoutSigner.free();
        account.client.close();
        core_1.TonClient.default.close();
        process.exit(0);
    },
};
exports.contractRunExecutorCommand = {
    name: "run-executor",
    alias: "e",
    title: "Emulate transaction executor locally on TVM",
    args: [
        fileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal, args) {
        const account = await (0, accounts_1.getAccount)(terminal, args);
        const { functionName, functionInput, } = await (0, run_1.getRunParams)(terminal, account, args);
        const result = await account.runLocal(functionName, functionInput, {
            performAllChecks: true,
        });
        await (0, run_1.logRunResult)(terminal, result.decoded, result.transaction);
        await account.free();
        account.client.close();
        core_1.TonClient.default.close();
        process.exit(0);
    },
};
const guardAccountIsActive = async (acc) => {
    const { active, uninit, frozen } = appkit_1.AccountType;
    const { acc_type: accType } = await acc.getAccount();
    if (accType === active)
        return;
    const status = accType === uninit
        ? 'is not initialized'
        : accType === frozen
            ? 'is frozen'
            : 'does not exist';
    throw Error(`Account ${await acc.getAddress()} ${status}`);
};
exports.Contract = {
    name: "contract",
    alias: "c",
    title: "Smart Contracts",
    commands: [
        exports.contractInfoCommand,
        exports.contractTopUpCommand,
        exports.contractDeployCommand,
        exports.contractRunCommand,
        exports.contractRunLocalCommand,
        exports.contractRunExecutorCommand,
    ],
};
//# sourceMappingURL=index.js.map