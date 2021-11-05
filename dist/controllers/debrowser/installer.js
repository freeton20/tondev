"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlInstances = exports.getAvailableVersions = void 0;
const utils_1 = require("../../core/utils");
const docker_1 = require("../../core/docker");
const DOCKER_IMAGE_NAME = "extraton/extraton-debrowser";
const DOCKER_CONTAINER_NAME = "extraton-debrowser";
async function getAvailableVersions() {
    const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
    return (await (0, utils_1.httpsGetJson)(url)).results.map((x) => x.name).sort(utils_1.compareVersionsDescending);
}
exports.getAvailableVersions = getAvailableVersions;
function instanceContainerDef(version) {
    const requiredImage = `${DOCKER_IMAGE_NAME}:${version}`;
    return {
        requiredImage,
        containerName: DOCKER_CONTAINER_NAME,
        createContainer(docker) {
            const ports = {
                '80/tcp': [
                    {
                        HostIp: '',
                        HostPort: '8087/tcp',
                    },
                ],
            };
            return docker.client.createContainer({
                name: DOCKER_CONTAINER_NAME,
                Image: requiredImage,
                HostConfig: {
                    PortBindings: ports,
                },
            });
        }
    };
}
async function controlInstances(control, version) {
    if (version === 'latest') {
        version = (await getAvailableVersions())[0];
    }
    const def = instanceContainerDef(version);
    await control(new docker_1.DevDocker(), def);
}
exports.controlInstances = controlInstances;
//# sourceMappingURL=installer.js.map