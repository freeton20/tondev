"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seDeleteCommand = exports.seSetCommand = exports.seUpdateCommand = exports.seResetCommand = exports.seStopCommand = exports.seStartCommand = exports.seVersionCommand = exports.seInfoCommand = exports.instanceArg = void 0;
const registry_1 = require("./registry");
const utils_1 = require("../../core/utils");
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
    description: "If you want to delete several instances (e.g. with \"*\") you should set this option.",
    defaultValue: "false",
};
exports.seInfoCommand = {
    name: "info",
    title: "Show SE Info",
    args: [exports.instanceArg],
    async run(terminal, args) {
        const table = [[
                "Instance",
                "State",
                "Version",
                "GraphQL Port",
                "ArangoDB Port",
                "Docker Container",
                "Docker Image",
            ]];
        const registry = new registry_1.SERegistry();
        for (const item of await registry.filter(args.instance, false)) {
            const info = await registry.getItemInfo(item);
            table.push([
                item.name,
                info.state,
                await registry.getSourceInfo(item),
                item.port,
                item.dbPort,
                info.docker.container,
                info.docker.image,
            ]);
        }
        terminal.log((0, utils_1.formatTable)(table, { headerSeparator: true }));
    },
};
exports.seVersionCommand = {
    name: "version",
    title: "Show SE Versions",
    async run(terminal, _args) {
        const registry = new registry_1.SERegistry();
        for (const item of registry.items) {
            terminal.log(`${item.name}: ${await registry.getSourceInfo(item)}`);
        }
        terminal.log(`Available Versions: ${(await registry_1.SERegistry.getVersions()).join(", ")}`);
    },
};
exports.seStartCommand = {
    name: "start",
    title: "Start SE Instance",
    args: [exports.instanceArg],
    async run(terminal, args) {
        await new registry_1.SERegistry().start(terminal, args.instance);
    },
};
exports.seStopCommand = {
    name: "stop",
    title: "Stop SE Instance",
    args: [exports.instanceArg],
    async run(terminal, args) {
        await new registry_1.SERegistry().stop(terminal, args.instance);
    },
};
exports.seResetCommand = {
    name: "reset",
    title: "Reset SE Instance",
    args: [exports.instanceArg],
    async run(terminal, args) {
        await new registry_1.SERegistry().reset(terminal, args.instance);
    },
};
exports.seUpdateCommand = {
    name: "update",
    title: "Update SE Instance Version",
    args: [exports.instanceArg],
    async run(terminal, args) {
        await new registry_1.SERegistry().update(terminal, args.instance);
    },
};
exports.seSetCommand = {
    name: "set",
    title: "Update SE Instance Config",
    args: [exports.instanceArg,
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
    async run(terminal, args) {
        await new registry_1.SERegistry().configure(terminal, args);
    },
};
exports.seDeleteCommand = {
    name: "delete",
    title: "Delete SE from list",
    description: "This command doesn't delete any docker container or image.",
    args: [exports.instanceArg, forceArg],
    async run(_terminal, args) {
        new registry_1.SERegistry().delete(args.instance, args.force);
    },
};
//# sourceMappingURL=commands.js.map