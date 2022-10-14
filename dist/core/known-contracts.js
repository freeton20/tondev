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
exports.KnownContracts = exports.loadAbi = exports.knownContractFromCodeHash = exports.knownContractByName = exports.knownContractFromAddress = void 0;
const appkit_1 = require("@eversdk/appkit");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function knownContractFromAddress(client, name, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield new appkit_1.Account({ abi: {} }, {
            client,
            address,
        }).getAccount();
        const codeHash = info.code_hash;
        if (!codeHash) {
            throw new Error(`${name} ${address} has no code deployed.`);
        }
        return knownContractFromCodeHash(codeHash, name, address);
    });
}
exports.knownContractFromAddress = knownContractFromAddress;
function knownContractByName(name) {
    if (!(name in exports.KnownContracts)) {
        throw new Error(`Unknown contract type ${name}.`);
    }
    return exports.KnownContracts[name];
}
exports.knownContractByName = knownContractByName;
function knownContractFromCodeHash(codeHash, name, address) {
    const contract = contracts[codeHash];
    if (!contract) {
        if (address) {
            throw new Error(`${name} ${address} has unknown code hash ${codeHash}.`);
        }
        throw new Error(`Unknown code hash ${codeHash} for ${name}.`);
    }
    return contract;
}
exports.knownContractFromCodeHash = knownContractFromCodeHash;
function contractsFile(name) {
    return path_1.default.resolve(__dirname, "..", "..", "contracts", name);
}
function loadAbi(name) {
    return JSON.parse(fs_1.default.readFileSync(contractsFile(`${name}.abi.json`), "utf8"));
}
exports.loadAbi = loadAbi;
exports.KnownContracts = {
    GiverV1: {
        name: "GiverV1",
        abi: loadAbi("GiverV1"),
    },
    GiverV2: {
        name: "GiverV2",
        abi: loadAbi("GiverV2"),
    },
    GiverV3: {
        name: "GiverV3",
        abi: loadAbi("GiverV3"),
    },
    SetcodeMultisigWallet: {
        name: "SetcodeMultisigWallet",
        abi: loadAbi("SetcodeMultisigWallet"),
    },
    SafeMultisigWallet: {
        name: "SafeMultisigWallet",
        abi: loadAbi("SafeMultisigWallet"),
    },
};
const contracts = {
    "4e92716de61d456e58f16e4e867e3e93a7548321eace86301b51c8b80ca6239b": exports.KnownContracts.GiverV2,
    ccbfc821853aa641af3813ebd477e26818b51e4ca23e5f6d34509215aa7123d9: exports.KnownContracts.GiverV2,
    e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208: exports.KnownContracts.SetcodeMultisigWallet,
    "207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82": exports.KnownContracts.SetcodeMultisigWallet,
    "80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105": exports.KnownContracts.SafeMultisigWallet,
};
//# sourceMappingURL=known-contracts.js.map