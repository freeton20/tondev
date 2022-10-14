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
exports.SignerTool = exports.signerDefaultCommand = exports.signerDeleteCommand = exports.signerGetCommand = exports.signerListCommand = exports.signerAddCommand = exports.signerGenerateCommand = void 0;
const registry_1 = require("./registry");
const core_1 = require("@eversdk/core");
const utils_1 = require("../../core/utils");
const registry_2 = require("../network/registry");
const nameArg = {
    isArg: true,
    name: "name",
    title: "Signer name",
    type: "string",
};
const secretArg = {
    isArg: true,
    name: "secret",
    title: "Secret key or seed phrase",
    type: "string",
};
const mnemonicOpt = {
    name: "mnemonic",
    alias: "m",
    title: "Use mnemonic phrase",
    type: "boolean",
    defaultValue: "false",
};
const dictionaryOpt = {
    name: "dictionary",
    alias: "d",
    type: "string",
    title: "Mnemonic dictionary",
    defaultValue: "1",
    getVariants() {
        return [
            {
                value: "0",
                description: "TON",
            },
            {
                value: "1",
                description: "English",
            },
            {
                value: "2",
                description: "Chinese Simplified",
            },
            {
                value: "3",
                description: "Chinese Traditional",
            },
            {
                value: "4",
                description: "French",
            },
            {
                value: "5",
                description: "Italian",
            },
            {
                value: "6",
                description: "Japanese",
            },
            {
                value: "7",
                description: "Korean",
            },
            {
                value: "8",
                description: "Spanish",
            },
        ];
    },
};
const wordsOpt = {
    name: "words",
    alias: "w",
    title: "Number of mnemonic words",
    type: "string",
    defaultValue: "12",
};
const forceOpt = {
    name: "force",
    alias: "f",
    title: "Overwrite signer if already exists",
    type: "boolean",
    defaultValue: "false",
};
exports.signerGenerateCommand = {
    name: "generate",
    alias: "g",
    title: "Add signer with randomly generated keys",
    args: [nameArg, mnemonicOpt, dictionaryOpt, wordsOpt, forceOpt],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.mnemonic) {
                const dictionary = Number.parseInt(args.dictionary);
                const word_count = Number.parseInt(args.words);
                const phrase = (yield core_1.TonClient.default.crypto.mnemonic_from_random({
                    dictionary,
                    word_count,
                })).phrase;
                yield new registry_1.SignerRegistry().addMnemonicKey(args.name, "", phrase, dictionary, args.force);
            }
            else {
                yield new registry_1.SignerRegistry().addSecretKey(args.name, "", (yield core_1.TonClient.default.crypto.generate_random_sign_keys()).secret, args.force);
            }
        });
    },
};
exports.signerAddCommand = {
    name: "add",
    title: "Add signer",
    args: [nameArg, secretArg, dictionaryOpt, forceOpt],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new registry_1.SignerRegistry().add(terminal, args);
        });
    },
};
exports.signerListCommand = {
    name: "list",
    alias: "l",
    title: "Prints list of registered signers",
    args: [],
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = new registry_1.SignerRegistry();
            const networks = new registry_2.NetworkRegistry();
            const rows = [["Signer", "Public Key", "Used", "Description"]];
            registry.items.forEach(x => {
                const summary = registry.getSignerSummary(x, networks);
                rows.push([
                    summary.name,
                    summary.public,
                    summary.used,
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
exports.signerGetCommand = {
    name: "info",
    alias: "i",
    title: "Get signer detailed information",
    args: [
        Object.assign(Object.assign({}, nameArg), { defaultValue: "" }),
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.name === "") {
                yield exports.signerListCommand.run(terminal, {});
                return;
            }
            const signer = new registry_1.SignerRegistry().get(args.name);
            terminal.log(JSON.stringify(signer, undefined, "    "));
        });
    },
};
exports.signerDeleteCommand = {
    name: "delete",
    title: "Delete signer from registry",
    args: [nameArg],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            new registry_1.SignerRegistry().delete(args.name);
        });
    },
};
exports.signerDefaultCommand = {
    name: "default",
    alias: "d",
    title: "Set default signer",
    args: [nameArg],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            new registry_1.SignerRegistry().setDefault(args.name);
        });
    },
};
exports.SignerTool = {
    name: "signer",
    alias: "s",
    title: "Signer Registry",
    commands: [
        exports.signerGenerateCommand,
        exports.signerAddCommand,
        exports.signerDeleteCommand,
        exports.signerListCommand,
        exports.signerGetCommand,
        exports.signerDefaultCommand,
    ],
};
//# sourceMappingURL=index.js.map