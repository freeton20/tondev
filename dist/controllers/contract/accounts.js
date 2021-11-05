"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccount = void 0;
const appkit_1 = require("@tonclient/appkit");
const registry_1 = require("../network/registry");
const core_1 = require("@tonclient/core");
const registry_2 = require("../signer/registry");
const param_parser_1 = require("./param-parser");
const utils_1 = require("../../core/utils");
async function getAccount(terminal, args) {
    var _a, _b;
    const address = (_a = args.address) !== null && _a !== void 0 ? _a : "";
    const network = new registry_1.NetworkRegistry().get(args.network);
    const client = new core_1.TonClient({
        network: {
            endpoints: network.endpoints,
        },
    });
    const contract = args.file !== "" ? (0, utils_1.resolveContract)(args.file) : { package: { abi: {} }, abiPath: "" };
    const signers = new registry_2.SignerRegistry();
    const signerItem = await signers.resolveItem(args.signer, {
        useNoneForEmptyName: address !== "",
    });
    const options = {
        signer: await signers.createSigner(signerItem),
        client,
    };
    const abiData = (_b = contract.package.abi.data) !== null && _b !== void 0 ? _b : [];
    if (abiData.length > 0 && args.data !== "") {
        options.initData = param_parser_1.ParamParser.components({
            name: "data",
            type: "tuple",
            components: abiData,
        }, args.data);
    }
    if (address !== "") {
        options.address = address;
    }
    const account = new appkit_1.Account(contract.package, options);
    terminal.log("\nConfiguration\n");
    terminal.log(`  Network: ${network.name} (${registry_1.NetworkRegistry.getEndpointsSummary(network)})`);
    terminal.log(`  Signer:  ${signerItem ? `${signerItem.name} (public ${signerItem.keys.public})` : "None"}\n`);
    if (address === "" && abiData.length > 0 && !options.initData) {
        terminal.log(`Address:   Can't calculate address: additional deploying data required.`);
    }
    else {
        terminal.log(`Address:   ${await account.getAddress()}${address === "" ? " (calculated from TVC and signer public)" : ""}`);
    }
    return account;
}
exports.getAccount = getAccount;
//# sourceMappingURL=accounts.js.map