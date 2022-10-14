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
exports.startCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
function writeEnterMessage(docker, terminal, containerName) {
    return __awaiter(this, void 0, void 0, function* () {
        const containerInfo = yield docker.findContainerInfo(containerName);
        if (null !== containerInfo) {
            terminal.log(`Open in browser: http://localhost:${containerInfo.Ports[0].PublicPort}/`);
        }
    });
}
exports.startCommand = {
    name: "start",
    title: "Start ExtraTON DeBrowser, default is 'latest'",
    args: [
        {
            isArg: true,
            name: "version",
            type: "string",
            title: "ExtraTON DeBrowser version (semver compatible)",
            defaultValue: "latest",
        },
    ],
    run(terminal, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, installer_1.controlInstances)((docker, def) => __awaiter(this, void 0, void 0, function* () {
                const containerInfo = yield docker.findContainerInfo(def.containerName);
                if (docker_1.DevDocker.isRunning(containerInfo)) {
                    terminal.log("Error: Container is already running.");
                }
                else {
                    if (null !== containerInfo &&
                        containerInfo.Image !== def.requiredImage) {
                        yield docker.shutdownContainer(terminal, def, docker_1.ContainerStatus.missing);
                    }
                    yield docker.startupContainer(terminal, def, docker_1.ContainerStatus.running);
                    yield writeEnterMessage(docker, terminal, def.containerName);
                }
            }), args.version);
        });
    },
};
//# sourceMappingURL=start.js.map