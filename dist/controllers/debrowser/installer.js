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
exports.controlInstances = exports.getAvailableVersions = void 0;
const utils_1 = require("../../core/utils");
const docker_1 = require("../../core/docker");
const DOCKER_IMAGE_NAME = "extraton/extraton-debrowser";
const DOCKER_CONTAINER_NAME = "extraton-debrowser";
function getAvailableVersions() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
        return (yield (0, utils_1.httpsGetJson)(url)).results
            .map((x) => x.name)
            .sort(utils_1.compareVersionsDescending);
    });
}
exports.getAvailableVersions = getAvailableVersions;
function instanceContainerDef(version) {
    const requiredImage = `${DOCKER_IMAGE_NAME}:${version}`;
    return {
        requiredImage,
        containerName: DOCKER_CONTAINER_NAME,
        createContainer(docker) {
            const ports = {
                "80/tcp": [
                    {
                        HostIp: "",
                        HostPort: "8087/tcp",
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
        },
    };
}
function controlInstances(control, version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (version === "latest") {
            version = (yield getAvailableVersions())[0];
        }
        const def = instanceContainerDef(version);
        yield control(new docker_1.DevDocker(), def);
    });
}
exports.controlInstances = controlInstances;
//# sourceMappingURL=installer.js.map