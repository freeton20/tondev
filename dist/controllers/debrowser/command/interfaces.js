"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfacesCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
const request_1 = __importDefault(require("request"));
exports.interfacesCommand = {
    name: "interfaces",
    title: "Show list of implemented interfaces",
    args: [],
    async run(terminal) {
        await (0, installer_1.controlInstances)(async (docker, def) => {
            const containerInfo = await docker.findContainerInfo(def.containerName);
            if (null !== containerInfo && docker_1.DevDocker.isRunning(containerInfo)) {
                const url = `http://localhost:${containerInfo.Ports[0].PublicPort}/interfaces.json`;
                (0, request_1.default)({ url, json: true }, function (error, response) {
                    if (null === error) {
                        terminal.log('Implemented interfaces:');
                        for (const ifc of response.body) {
                            terminal.log(` - ${ifc.name}`);
                        }
                    }
                    else {
                        terminal.log(`Error: ${error}.`);
                    }
                });
            }
            else {
                terminal.log("Error: Container isn't running.");
            }
        });
    },
};
//# sourceMappingURL=interfaces.js.map