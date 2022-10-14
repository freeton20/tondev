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
exports.seDeleteCommand = exports.seSetCommand = exports.seUpdateCommand = exports.seResetCommand = exports.seStopCommand = exports.seStartCommand = exports.seVersionCommand = exports.seInfoCommand = exports.instanceArg = void 0;
const registry_1 = require("./registry");
const utils_1 = require("../../core/utils");
const help_1 = require("../../everdev/help");
const _1 = require(".");
exports.instanceArg = {
    isArg: true,
    name: "instance",
    type: "string",
    defaultValue: "*",
    title: "SE Instance Filter",
};
const forceArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Delete multiple instances",
    description: 'If you want to delete several instances (e.g. with "*") you should set this option.',
    defaultValue: "false",
};
exports.seInfoCommand = {
    name: "info",
    title: "Show SE Info",
    args: [exports.instanceArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = [
                [
                    "Instance",
                    "State",
                    "Version",
                    "GraphQL Port",
                    "ArangoDB Port",
                    "Docker Container",
                    "Docker Image",
                ],
            ];
            const registry = new registry_1.SERegistry();
            for (const item of registry.filter(args.instance, false)) {
                const info = yield registry.getItemInfo(item);
                table.push([
                    item.name,
                    info.state,
                    yield registry.getSourceInfo(item),
                    item.port,
                    item.dbPort,
                    info.docker.container,
                    info.docker.image,
                ]);
            }
            terminal.log((0, utils_1.formatTable)(table, { headerSeparator: true }));
        });
    },
};
exports.seVersionCommand = {
    name: "version",
    title: "Show SE Versions",
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const registry = new registry_1.SERegistry();
            for (const item of registry.items) {
                terminal.log(`${item.name}: ${yield registry.getSourceInfo(item)}`);
            }
            terminal.log(`Available Versions: ${(yield registry_1.SERegistry.getVersions()).join(", ")}`);
        });
    },
};
exports.seStartCommand = {
    name: "start",
    title: "Start SE Instance",
    args: [exports.instanceArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new registry_1.SERegistry().start(terminal, args.instance);
        });
    },
};
exports.seStopCommand = {
    name: "stop",
    title: "Stop SE Instance",
    args: [exports.instanceArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new registry_1.SERegistry().stop(terminal, args.instance);
        });
    },
};
exports.seResetCommand = {
    name: "reset",
    title: "Reset SE Instance",
    args: [exports.instanceArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new registry_1.SERegistry().reset(terminal, args.instance);
        });
    },
};
exports.seUpdateCommand = {
    name: "update",
    title: "Update SE Instance Version",
    args: [exports.instanceArg],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new registry_1.SERegistry().update(terminal, args.instance);
        });
    },
};
exports.seSetCommand = {
    name: "set",
    title: "Update SE Instance Config",
    args: [
        exports.instanceArg,
        {
            name: "version",
            title: "SE version (version number or `latest`)",
            type: "string",
            defaultValue: "",
        },
        {
            name: "image",
            title: "Custom SE docker image name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "container",
            title: "Custom SE docker container name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "port",
            title: "Port on localhost used to expose GraphQL API",
            type: "string",
            defaultValue: "",
        },
        {
            name: "db-port",
            title: "Port on localhost used to expose ArangoDB API (number or `none`)",
            type: "string",
            defaultValue: "",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield new registry_1.SERegistry().configure(terminal, args);
            }
            catch (err) {
                if (err instanceof registry_1.RegistryError) {
                    // Show HELP section
                    const terminal = new utils_1.StringTerminal();
                    terminal.log(err.message + "\n");
                    yield (0, help_1.printUsage)(terminal, _1.SE, this);
                    throw Error(terminal.stdout);
                }
                else {
                    throw err;
                }
            }
        });
    },
};
exports.seDeleteCommand = {
    name: "delete",
    title: "Delete SE from list",
    description: "This command doesn't delete any docker container or image.",
    args: [exports.instanceArg, forceArg],
    run(_terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            new registry_1.SERegistry().delete(args.instance, args.force);
        });
    },
};
//# sourceMappingURL=commands.js.map