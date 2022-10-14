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
exports.NetworkTool = exports.networkCredsCommand = exports.networkGiverCommand = exports.networkDefaultCommand = exports.networkDeleteCommand = exports.networkInfoCommand = exports.networkListCommand = exports.networkAddCommand = void 0;
const registry_1 = require("./registry");
const utils_1 = require("../../core/utils");
const forceArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Overwrite key if already exists",
    defaultValue: "false",
};
const nameArg = {
    isArg: true,
    name: "name",
    type: "string",
    title: "Network name",
};
exports.networkAddCommand = {
    name: "add",
    title: "Add net",
    args: [
        nameArg,
        {
            isArg: true,
            name: "endpoints",
            type: "string",
            title: "Comma separated endpoints",
        },
        forceArg,
    ],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoints = args.endpoints.split(",").filter(x => x !== "");
            new registry_1.NetworkRegistry().add(args.name, "", endpoints, args.force);
        });
    },
};
exports.networkListCommand = {
    name: "list",
    alias: "l",
    title: "Prints list of networks",
    args: [],
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = new registry_1.NetworkRegistry();
            const rows = [["Network", "Endpoints", "Giver", "Description"]];
            registry.items.forEach(network => {
                const summary = registry.getNetworkSummary(network);
                rows.push([
                    summary.name,
                    summary.endpoints,
                    summary.giver,
                    summary.description,
                ]);
            });
            const table = (0, utils_1.formatTable)(rows, { headerSeparator: true });
            if (table.trim() !== "") {
                terminal.log(table);
            }
        });
    },
};
exports.networkInfoCommand = {
    name: "info",
    alias: "i",
    title: "Prints network detailed information",
    args: [
        Object.assign(Object.assign({}, nameArg), { defaultValue: "" }),
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.name === "") {
                return exports.networkListCommand.run(terminal, {});
            }
            const registry = new registry_1.NetworkRegistry();
            const network = registry.get(args.name);
            const rows = [["Network", network.name]];
            rows.push(["Endpoints", network.endpoints.join(", ")]);
            const giver = network.giver;
            if (giver) {
                rows.push(["Giver", (0, registry_1.getGiverSummary)(giver)]);
            }
            if (network.name === registry.default) {
                rows.push(["Default", "true"]);
            }
            if (network.description) {
                rows.push(["Description", network.description]);
            }
            terminal.log((0, utils_1.formatTable)(rows));
        });
    },
};
exports.networkDeleteCommand = {
    name: "delete",
    title: "Delete network from registry",
    args: [nameArg],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            new registry_1.NetworkRegistry().delete(args.name);
        });
    },
};
exports.networkDefaultCommand = {
    name: "default",
    alias: "d",
    title: "Set default network",
    args: [nameArg],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            new registry_1.NetworkRegistry().setDefault(args.name);
        });
    },
};
exports.networkGiverCommand = {
    name: "giver",
    alias: "g",
    title: "Set giver for network",
    args: [
        nameArg,
        {
            isArg: true,
            name: "address",
            title: "Giver address",
            type: "string",
            defaultValue: "",
        },
        {
            name: "signer",
            alias: "s",
            title: "Signer to be used with giver",
            type: "string",
            defaultValue: "",
        },
        {
            name: "value",
            alias: "v",
            title: "Deploying account initial balance in nanotokens",
            type: "string",
            defaultValue: "",
        },
        {
            name: "type",
            alias: "t",
            title: "Type giver contract (GiverV1 | GiverV2 | GiverV3 | SafeMultisigWallet | SetcodeMultisigWallet)",
            type: "string",
            defaultValue: "auto",
        },
    ],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = (0, utils_1.parseNumber)(args.value);
            return new registry_1.NetworkRegistry().setGiver(args.name, args.address, args.signer, value, args.type);
        });
    },
};
exports.networkCredsCommand = {
    name: "credentials",
    alias: "c",
    title: "Set credentials for network authentication",
    args: [
        nameArg,
        {
            name: "project",
            alias: "p",
            title: "Your project ID",
            type: "string",
            defaultValue: "",
        },
        {
            name: "access-key",
            alias: "k",
            title: "Your secret or JWT token",
            type: "string",
            defaultValue: "",
        },
        {
            name: "clear",
            title: "Clear saved credentials (mutually exclusive with other options)",
            type: "boolean",
            defaultValue: "",
        },
    ],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new registry_1.NetworkRegistry().setCredentials(args.name, args.project, args.accessKey, args.clear);
        });
    },
};
exports.NetworkTool = {
    name: "network",
    alias: "n",
    title: "Network Registry",
    commands: [
        exports.networkAddCommand,
        exports.networkDeleteCommand,
        exports.networkListCommand,
        exports.networkInfoCommand,
        exports.networkDefaultCommand,
        exports.networkGiverCommand,
        exports.networkCredsCommand,
    ],
};
//# sourceMappingURL=index.js.map