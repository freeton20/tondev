"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
async function writeEnterMessage(docker, terminal, containerName) {
    const containerInfo = await docker.findContainerInfo(containerName);
    if (null !== containerInfo) {
        terminal.log(`Open in browser: http://localhost:${containerInfo.Ports[0].PublicPort}/`);
    }
}
exports.startCommand = {
    name: "start",
    title: "Start ExtraTON DeBrowser, default is 'latest'",
    args: [{
            isArg: true,
            name: 'version',
            type: 'string',
            title: 'ExtraTON DeBrowser version (semver compatible)',
            defaultValue: 'latest',
        }],
    async run(terminal, args) {
        await (0, installer_1.controlInstances)(async (docker, def) => {
            const containerInfo = await docker.findContainerInfo(def.containerName);
            if (docker_1.DevDocker.isRunning(containerInfo)) {
                terminal.log('Error: Container is already running.');
            }
            else {
                if (null !== containerInfo && containerInfo.Image !== def.requiredImage) {
                    await docker.shutdownContainer(terminal, def, docker_1.ContainerStatus.missing);
                }
                await docker.startupContainer(terminal, def, docker_1.ContainerStatus.running);
                await writeEnterMessage(docker, terminal, def.containerName);
            }
        }, args.version);
    },
};
//# sourceMappingURL=start.js.map