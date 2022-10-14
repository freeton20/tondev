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
exports.SignerRegistry = exports.MnemonicDictionary = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("../../core");
const core_2 = require("@eversdk/core");
const utils_1 = require("../../core/utils");
function signerHome() {
    return path_1.default.resolve((0, core_1.everdevHome)(), "signer");
}
function registryPath() {
    return path_1.default.resolve(signerHome(), "registry.json");
}
var MnemonicDictionary;
(function (MnemonicDictionary) {
    MnemonicDictionary[MnemonicDictionary["ton"] = 0] = "ton";
    MnemonicDictionary[MnemonicDictionary["english"] = 1] = "english";
    MnemonicDictionary[MnemonicDictionary["chineseSimplified"] = 2] = "chineseSimplified";
    MnemonicDictionary[MnemonicDictionary["chineseTraditional"] = 3] = "chineseTraditional";
    MnemonicDictionary[MnemonicDictionary["french"] = 4] = "french";
    MnemonicDictionary[MnemonicDictionary["italian"] = 5] = "italian";
    MnemonicDictionary[MnemonicDictionary["japanese"] = 6] = "japanese";
    MnemonicDictionary[MnemonicDictionary["korean"] = 7] = "korean";
    MnemonicDictionary[MnemonicDictionary["spanish"] = 8] = "spanish";
})(MnemonicDictionary = exports.MnemonicDictionary || (exports.MnemonicDictionary = {}));
class SignerRegistry {
    constructor() {
        var _a;
        this.items = [];
        if (fs_extra_1.default.pathExistsSync(registryPath())) {
            try {
                const loaded = JSON.parse(fs_extra_1.default.readFileSync(registryPath(), "utf8"));
                this.items = (_a = loaded.items) !== null && _a !== void 0 ? _a : [];
                this.default = loaded.default;
            }
            catch (_b) { } /* eslint-disable-line no-empty */
        }
    }
    save() {
        (0, utils_1.writeJsonFile)(registryPath(), {
            items: this.items,
            default: this.default,
        });
    }
    add(_terminal, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { secret, name, force } = args;
            const words = secret.split(" ").filter(x => x !== "");
            if (words.length > 1) {
                const dictionary = Number.parseInt(args.dictionary);
                const phrase = words.join(" ");
                yield this.addMnemonicKey(name, "", phrase, dictionary, force);
            }
            else if ((0, utils_1.isHex)(args.secret) && secret.length === 64) {
                yield this.addSecretKey(name, "", secret, force);
            }
            else {
                const keysPath = (0, utils_1.resolvePath)(secret);
                if (fs_extra_1.default.existsSync(keysPath)) {
                    try {
                        const keys = JSON.parse(fs_extra_1.default.readFileSync(keysPath, "utf8"));
                        yield this.addSecretKey(name, "", (_a = keys.secret) !== null && _a !== void 0 ? _a : "", force);
                    }
                    catch (error) {
                        throw new Error(`Invalid keys file.\nExpected JSON file with structure: { "public": "...", "secret": "..." }.`);
                    }
                }
                else {
                    throw new Error(`Invalid secret source: ${secret}. You can specify secret key, seed phrase or file name with the keys.`);
                }
            }
        });
    }
    addItem(item, overwrite) {
        const existingIndex = this.items.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Signer with name "${item.name}" already exists.`);
        }
        if (existingIndex >= 0) {
            this.items[existingIndex] = item;
        }
        else {
            this.items.push(item);
        }
        if (!this.default) {
            this.default = item.name;
        }
        this.save();
    }
    addSecretKey(name, description, secret, overwrite) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = {
                public: (yield core_2.TonClient.default.crypto.nacl_sign_keypair_from_secret_key({ secret })).public,
                secret,
            };
            this.addItem({
                name,
                description,
                keys,
            }, overwrite);
        });
    }
    addMnemonicKey(name, description, phrase, dictionary, overwrite) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = (yield core_2.TonClient.default.crypto.mnemonic_derive_sign_keys({
                phrase,
                dictionary,
            })).secret;
            const keys = {
                public: (yield core_2.TonClient.default.crypto.nacl_sign_keypair_from_secret_key({ secret })).public,
                secret,
            };
            this.addItem({
                name,
                description,
                keys,
                mnemonic: {
                    dictionary,
                    phrase,
                },
            }, overwrite);
        });
    }
    find(name) {
        var _a;
        let findName = name.toLowerCase().trim();
        if (findName === "") {
            findName = (_a = this.default) !== null && _a !== void 0 ? _a : "";
        }
        return this.items.find(x => x.name.toLowerCase() === findName);
    }
    get(name) {
        var _a;
        let findName = name.trim();
        if (findName === "") {
            findName = (_a = this.default) !== null && _a !== void 0 ? _a : "";
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error("There are no signers defined. " +
                    'Use "everdev signer add" command to register a signer.');
            }
            else {
                throw new Error("There is no default signer. " +
                    'Use "everdev signer default" command to set the default signer. ' +
                    'Or explicitly specify the signer with "--signer" option.');
            }
        }
        const signer = this.items.find(x => x.name.toLowerCase() === findName.toLowerCase());
        if (signer) {
            return signer;
        }
        throw new Error(`Signer not found: ${name}`);
    }
    delete(name) {
        const signer = this.get(name);
        this.items.splice(this.items.findIndex(x => x.name === signer.name), 1);
        if (this.default === signer.name) {
            this.default = undefined;
        }
        this.save();
    }
    setDefault(name) {
        this.default = this.get(name).name;
        this.save();
    }
    resolveItem(name, options) {
        var _a;
        name = name.trim().toLowerCase();
        if (name === "none") {
            return null;
        }
        if (name === "") {
            name = (_a = this.default) !== null && _a !== void 0 ? _a : "";
        }
        if (name === "" && options.useNoneForEmptyName) {
            return null;
        }
        return this.get(name);
    }
    createSigner(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return item !== null ? (0, core_2.signerKeys)(item.keys) : (0, core_2.signerNone)();
        });
    }
    resolveSigner(name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createSigner(this.resolveItem(name, options));
        });
    }
    getSignerSummary(signer, networks) {
        const used = [];
        networks.items.forEach(network => {
            if (network.giver) {
                if (network.giver.signer === signer.name) {
                    used.push(`${network.name} network giver signer`);
                }
            }
        });
        return {
            name: `${signer.name}${signer.name === this.default ? " (Default)" : ""}`,
            public: signer.keys.public,
            description: signer.description,
            used: used.join("\n"),
        };
    }
}
exports.SignerRegistry = SignerRegistry;
//# sourceMappingURL=registry.js.map