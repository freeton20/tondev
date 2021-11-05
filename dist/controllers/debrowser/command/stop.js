"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
exports.stopCommand = {
    name: "stop",
    title: "Stop ExtraTON DeBrowser",
    args: [],
    async run(terminal) {
        await (0, installer_1.controlInstances)(async (docker, def) => {
            await docker.shutdownContainer(terminal, def, docker_1.ContainerStatus.created);
        });
    },
};
//# sourceMappingURL=stop.js.map