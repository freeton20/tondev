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
exports.NetworkRegistry = exports.getGiverSummary = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("../../core");
const giver_1 = require("./giver");
const core_2 = require("@eversdk/core");
const known_contracts_1 = require("../../core/known-contracts");
const utils_1 = require("../../core/utils");
function networkHome() {
    return path_1.default.resolve((0, core_1.everdevHome)(), "network");
}
function registryPath() {
    return path_1.default.resolve(networkHome(), "registry.json");
}
function getGiverSummary(giver) {
    if (!giver) {
        return "";
    }
    const { signer, name, address } = giver;
    return `${address}\n${name}${signer ? ` signed by ${signer}` : ""}`;
}
exports.getGiverSummary = getGiverSummary;
class NetworkRegistry {
    constructor() {
        var _a;
        this.items = [];
        let loaded = false;
        if (fs_extra_1.default.pathExistsSync(registryPath())) {
            try {
                const data = JSON.parse(fs_extra_1.default.readFileSync(registryPath(), "utf8"));
                this.items = (_a = data.items) !== null && _a !== void 0 ? _a : [];
                if (data.default) {
                    this.default = data.default;
                }
                loaded = true;
            }
            catch (_b) { } // eslint-disable-line no-empty
        }
        if (!loaded) {
            this.items = [
                {
                    name: "se",
                    endpoints: ["http://localhost"],
                    giver: {
                        name: known_contracts_1.KnownContracts.GiverV2.name,
                        address: "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5",
                        signer: "",
                    },
                },
                {
                    name: "dev",
                    endpoints: ["devnet.evercloud.dev"],
                },
                {
                    name: "main",
                    endpoints: ["mainnet.evercloud.dev"],
                },
            ];
            this.default = "dev";
        }
    }
    save() {
        if (!fs_extra_1.default.pathExistsSync(networkHome())) {
            fs_extra_1.default.mkdirSync(networkHome(), { recursive: true });
        }
        (0, utils_1.writeJsonFile)(registryPath(), {
            items: this.items,
            default: this.default,
        });
    }
    add(name, description, endpoints, overwrite) {
        name = name.trim();
        const existingIndex = this.items.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Net "${name}" already exists.`);
        }
        const network = {
            name,
            description,
            endpoints,
        };
        if (existingIndex >= 0) {
            this.items[existingIndex] = network;
        }
        else {
            this.items.push(network);
        }
        if (!this.default) {
            this.default = name;
        }
        this.save();
    }
    get(name) {
        var _a;
        let findName = name.toLowerCase().trim();
        if (findName === "") {
            findName = (_a = this.default) !== null && _a !== void 0 ? _a : "";
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error("There are no networks defined. " +
                    'Use "everdev network add" command to register a network.');
            }
            else {
                throw new Error("There is no default network. " +
                    'Use "everdev network default" command to set the default network. ' +
                    'Or explicitly specify the network with "--network" option.');
            }
        }
        const network = this.items.find(x => x.name.toLowerCase() === findName);
        if (network) {
            return network;
        }
        throw new Error(`Network not found: ${name}`);
    }
    delete(name) {
        const net = this.get(name);
        this.items.splice(this.items.findIndex(x => x.name === net.name), 1);
        if (this.default === net.name) {
            delete this.default;
        }
        this.save();
    }
    setDefault(name) {
        this.default = this.get(name).name;
        this.save();
    }
    setGiver(networkName, address, signer, value, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = this.get(networkName);
            const client = new core_2.TonClient({
                network: { endpoints: network.endpoints },
            });
            try {
                const giver = yield giver_1.NetworkGiver.create(client, {
                    name,
                    address,
                    signer,
                    value,
                });
                network.giver = {
                    name: giver.contract.name,
                    address: giver.address,
                    signer,
                    value,
                };
                this.save();
            }
            finally {
                yield client.close();
            }
        });
    }
    setCredentials(name, project, accessKey, clear) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = this.get(name);
            if (!project && !accessKey) {
                if (clear) {
                    network.credentials = null;
                }
                else {
                    throw Error("At least one option is required");
                }
            }
            else {
                if (clear) {
                    throw Error("--clear option can not be used with other options");
                }
                else {
                    network.credentials = Object.assign(Object.assign({}, (project ? { project } : {})), (accessKey ? { accessKey } : {}));
                }
            }
            this.save();
        });
    }
    static getEndpointsSummary(network) {
        const maxEndpoints = 3;
        const endpoints = network.endpoints.length <= maxEndpoints
            ? network.endpoints
            : [...network.endpoints.slice(0, maxEndpoints), "..."];
        return endpoints.join(", ");
    }
    getNetworkSummary(network) {
        var _a;
        return {
            name: `${network.name}${network.name === this.default ? " (Default)" : ""}`,
            endpoints: NetworkRegistry.getEndpointsSummary(network),
            giver: getGiverSummary(network.giver),
            description: (_a = network.description) !== null && _a !== void 0 ? _a : "",
        };
    }
}
exports.NetworkRegistry = NetworkRegistry;
//# sourceMappingURL=registry.js.map