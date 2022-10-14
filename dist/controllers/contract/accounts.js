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
exports.getAccount = exports.transormEndpoint = void 0;
const appkit_1 = require("@eversdk/appkit");
const registry_1 = require("../network/registry");
const core_1 = require("@eversdk/core");
const registry_2 = require("../signer/registry");
const param_parser_1 = require("./param-parser");
const utils_1 = require("../../core/utils");
// Remove sufix graphql if exists and add projectId
// Intentionally do not use URL object or any modules,
// because url may lack `http://` prefix
const transormEndpoint = (project) => (url) => {
    const result = url
        .trim()
        .replace(/\/graphql\/?$/i, "")
        .replace(/\/$/, "");
    return project ? `${result}/${project}` : result;
};
exports.transormEndpoint = transormEndpoint;
function getAccount(terminal, args) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const address = (_a = args.address) !== null && _a !== void 0 ? _a : "";
        const network = new registry_1.NetworkRegistry().get(args.network);
        const { project, accessKey } = network.credentials || {};
        const client = new core_1.TonClient({
            network: Object.assign({ endpoints: network.endpoints.map((0, exports.transormEndpoint)(project)) }, (accessKey ? { access_key: accessKey } : {})),
        });
        const contract = args.file !== ""
            ? (0, utils_1.resolveContract)(args.file)
            : { package: { abi: {} }, abiPath: "" };
        const signers = new registry_2.SignerRegistry();
        const signerItem = yield signers.resolveItem(args.signer, {
            useNoneForEmptyName: address !== "",
        });
        const options = {
            signer: yield signers.createSigner(signerItem),
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
        terminal.log(`  Signer:  ${signerItem
            ? `${signerItem.name} (public ${signerItem.keys.public})`
            : "None"}\n`);
        if (address === "" && abiData.length > 0 && !options.initData) {
            terminal.log(`Address:   Can't calculate address: additional deploying data required.`);
        }
        else {
            terminal.log(`Address:   ${yield account.getAddress()}${address === "" ? " (calculated from TVC and signer public)" : ""}`);
        }
        return account;
    });
}
exports.getAccount = getAccount;
//# sourceMappingURL=accounts.js.map