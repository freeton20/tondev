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
exports.SERegistry = exports.updateInstance = exports.seSourceDockerContainer = exports.seSourceDockerImage = exports.seSourceVersion = exports.SESourceType = exports.RegistryError = exports.PORT_NONE = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const core_1 = require("../../core");
const utils_1 = require("../../core/utils");
const docker_1 = require("../../core/docker");
const DEFAULT_INSTANCE_NAME = "default";
const DEFAULT_INSTANCE_PORT = 80;
const DOCKER_IMAGE_NAME = "tonlabs/local-node";
const DOCKER_CONTAINER_NAME_PREFIX = "tonlabs-tonos-se";
exports.PORT_NONE = -1;
const TOOL_FOLDER_NAME = "se";
function seHome() {
    return path_1.default.resolve((0, core_1.everdevHome)(), TOOL_FOLDER_NAME);
}
class RegistryError extends Error {
}
exports.RegistryError = RegistryError;
var SESourceType;
(function (SESourceType) {
    SESourceType["TONOS_SE_VERSION"] = "tonos-se-version";
    SESourceType["DOCKER_IMAGE"] = "docker-image";
    SESourceType["DOCKER_CONTAINER"] = "docker-container";
})(SESourceType = exports.SESourceType || (exports.SESourceType = {}));
function seSourceVersion(version) {
    return {
        type: SESourceType.TONOS_SE_VERSION,
        version,
    };
}
exports.seSourceVersion = seSourceVersion;
function seSourceDockerImage(image) {
    return {
        type: SESourceType.DOCKER_IMAGE,
        image,
    };
}
exports.seSourceDockerImage = seSourceDockerImage;
function seSourceDockerContainer(container, image) {
    return {
        type: SESourceType.DOCKER_CONTAINER,
        container,
        image,
    };
}
exports.seSourceDockerContainer = seSourceDockerContainer;
function registryPath() {
    return path_1.default.resolve(seHome(), "config.json");
}
function mapContainerName(name) {
    return name.startsWith("/") ? name.substr(1) : name;
}
function updateInstance(instance, updates) {
    if (updates.source === undefined &&
        updates.port === undefined &&
        updates.dbPort === undefined) {
        throw new RegistryError("You have to specify at least one config parameter");
    }
    if (updates.source !== undefined) {
        instance.source = updates.source;
    }
    if (updates.port !== undefined) {
        instance.port = updates.port;
    }
    if (updates.dbPort === exports.PORT_NONE) {
        delete instance.dbPort;
    }
    else if (updates.dbPort !== undefined) {
        instance.dbPort = updates.dbPort;
    }
}
exports.updateInstance = updateInstance;
class SERegistry {
    constructor() {
        var _a, _b;
        this.docker = undefined;
        this.items = [];
        try {
            if (fs_1.default.existsSync(registryPath())) {
                const loaded = JSON.parse(fs_1.default.readFileSync(registryPath(), "utf8"));
                this.items = (_b = (_a = loaded === null || loaded === void 0 ? void 0 : loaded.instances) !== null && _a !== void 0 ? _a : loaded === null || loaded === void 0 ? void 0 : loaded.items) !== null && _b !== void 0 ? _b : [];
                this.items.forEach(instance => {
                    const deprecated = instance;
                    if (deprecated.version !== undefined) {
                        instance.source = seSourceVersion(deprecated.version);
                        delete deprecated.version;
                    }
                });
            }
        }
        catch (_c) { } /* eslint-disable-line no-empty */
        if (this.items.length === 0) {
            this.items.push({
                name: DEFAULT_INSTANCE_NAME,
                port: DEFAULT_INSTANCE_PORT,
                source: seSourceVersion(""),
            });
            this.save();
        }
    }
    getDocker() {
        if (this.docker !== undefined) {
            return this.docker;
        }
        this.docker = new docker_1.DevDocker();
        return this.docker;
    }
    save() {
        (0, utils_1.writeJsonFile)(registryPath(), {
            items: this.items,
        });
    }
    static getVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
            return (yield (0, utils_1.httpsGetJson)(url)).results
                .map((x) => x.name)
                .sort(utils_1.compareVersionsDescending);
        });
    }
    static getLatestVersion() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const versions = yield SERegistry.getVersions();
            const version = versions.shift();
            if (version && version.toLowerCase() !== "latest") {
                return version;
            }
            return (_a = versions.shift()) !== null && _a !== void 0 ? _a : "";
        });
    }
    filter(filter, autoCreate) {
        const names = filter
            .toLowerCase()
            .split(",")
            .map(x => x.trim())
            .filter(x => x !== "");
        if (names.includes("*")) {
            return this.items;
        }
        const filtered = [];
        names.forEach(name => {
            let instance = this.items.find(x => x.name.toLowerCase() === name);
            if (instance === undefined) {
                if (names.length === 1 && autoCreate) {
                    instance = {
                        name: filter.trim(),
                        port: DEFAULT_INSTANCE_PORT,
                        source: seSourceVersion(""),
                    };
                    this.items.push(instance);
                }
                else {
                    throw new Error(`Instance "${name}" is not found`);
                }
            }
            filtered.push(instance);
        });
        return filtered;
    }
    resolveItemSourceVersion(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item.source.type === SESourceType.TONOS_SE_VERSION) {
                if (item.source.version === "" ||
                    item.source.version === "latest") {
                    item.source.version = yield SERegistry.getLatestVersion();
                    this.save();
                }
                return item.source.version;
            }
            return "";
        });
    }
    itemContainerDef(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let requiredImage;
            let containerName;
            const source = item.source;
            switch (source.type) {
                case SESourceType.TONOS_SE_VERSION:
                    {
                        requiredImage = `${DOCKER_IMAGE_NAME}:${yield this.resolveItemSourceVersion(item)}`;
                        const suffix = item.name !== DEFAULT_INSTANCE_NAME
                            ? `-${item.name}`
                            : "";
                        containerName = `${DOCKER_CONTAINER_NAME_PREFIX}-${(0, utils_1.userIdentifier)()}${suffix}`;
                    }
                    break;
                case SESourceType.DOCKER_IMAGE:
                    {
                        requiredImage = source.image;
                        const suffix = item.name !== DEFAULT_INSTANCE_NAME
                            ? `-${item.name}`
                            : "";
                        containerName = `${DOCKER_CONTAINER_NAME_PREFIX}-${(0, utils_1.userIdentifier)()}${suffix}`;
                    }
                    break;
                case SESourceType.DOCKER_CONTAINER:
                    {
                        containerName = source.container;
                        requiredImage = source.image;
                    }
                    break;
            }
            return {
                requiredImage,
                containerName,
                createContainer(docker) {
                    const ports = {
                        "80/tcp": [
                            {
                                HostIp: "",
                                HostPort: `${item.port}`,
                            },
                        ],
                    };
                    if (item.dbPort) {
                        ports["8529/tcp"] = [
                            {
                                HostIp: "",
                                HostPort: `${item.dbPort}`,
                            },
                        ];
                    }
                    return docker.client.createContainer({
                        name: containerName,
                        // interactive: true,
                        Image: requiredImage,
                        Env: ["USER_AGREEMENT=yes"],
                        HostConfig: {
                            PortBindings: ports,
                        },
                    });
                },
            };
        });
    }
    getSourceInfo(item) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (item.source.type) {
                case SESourceType.TONOS_SE_VERSION:
                    return yield this.resolveItemSourceVersion(item);
                case SESourceType.DOCKER_IMAGE:
                    return `${item.source.image} image`;
                case SESourceType.DOCKER_CONTAINER:
                    return `${item.source.container} container`;
            }
        });
    }
    getItemInfo(item) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const def = yield this.itemContainerDef(item);
            const info = yield this.getDocker().findContainerInfo(def.containerName);
            return {
                state: info ? info.State : "not installed",
                docker: {
                    image: (_a = info === null || info === void 0 ? void 0 : info.Image) !== null && _a !== void 0 ? _a : def.requiredImage,
                    container: (_b = info === null || info === void 0 ? void 0 : info.Names.map(mapContainerName).join(", ")) !== null && _b !== void 0 ? _b : def.containerName,
                },
            };
        });
    }
    updateConfig(terminal, filter, updateInstance, autoCreate) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.filter(filter, autoCreate);
            const docker = this.getDocker();
            for (const item of items) {
                const save = JSON.stringify(item);
                yield updateInstance(item);
                if (JSON.stringify(item) !== save) {
                    const def = yield this.itemContainerDef(item);
                    const info = yield this.getItemInfo(item);
                    yield docker.shutdownContainer(terminal, def, docker_1.ContainerStatus.missing);
                    yield docker.startupContainer(terminal, def, info.state === "running"
                        ? docker_1.ContainerStatus.running
                        : docker_1.ContainerStatus.created);
                }
            }
            this.save();
        });
    }
    controlItems(instanceFilter, control) {
        return __awaiter(this, void 0, void 0, function* () {
            const defs = [];
            for (const item of yield this.filter(instanceFilter, false)) {
                defs.push(yield this.itemContainerDef(item));
            }
            yield control(this.getDocker(), defs);
        });
    }
    start(terminal, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controlItems(instance, (docker, defs) => __awaiter(this, void 0, void 0, function* () {
                yield docker.startupContainers(terminal, defs, docker_1.ContainerStatus.running);
            }));
        });
    }
    stop(terminal, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controlItems(instance, (docker, defs) => __awaiter(this, void 0, void 0, function* () {
                yield docker.shutdownContainers(terminal, defs, docker_1.ContainerStatus.created);
            }));
        });
    }
    reset(terminal, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controlItems(instance, (docker, defs) => __awaiter(this, void 0, void 0, function* () {
                yield docker.shutdownContainers(terminal, defs, docker_1.ContainerStatus.missing);
                yield docker.startupContainers(terminal, defs, docker_1.ContainerStatus.running);
            }));
        });
    }
    update(terminal, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateConfig(terminal, instance, (instance) => __awaiter(this, void 0, void 0, function* () {
                if (instance.source.type === SESourceType.TONOS_SE_VERSION) {
                    updateInstance(instance, {
                        source: seSourceVersion(yield SERegistry.getLatestVersion()),
                    });
                }
            }), false);
        });
    }
    configure(terminal, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const updates = {};
            const sources = [args.version, args.image, args.container].filter(x => x !== "");
            if (sources.length > 1) {
                throw new Error('You can\'t specify several SE sources. Please choose on of the "version", "image" or "container" option.');
            }
            if (args.version !== "") {
                let version = args.version;
                if (version.toLowerCase() === "latest") {
                    version = yield SERegistry.getLatestVersion();
                }
                else {
                    if (!(yield SERegistry.getVersions()).includes(version)) {
                        throw new Error(`Invalid version: ${version}`);
                    }
                }
                updates.source = seSourceVersion(version);
            }
            else if (args.image !== "") {
                updates.source = seSourceDockerImage(args.image);
            }
            else if (args.container !== "") {
                const docker = this.getDocker();
                const image = (_a = (yield docker.findContainerInfo(args.container))) === null || _a === void 0 ? void 0 : _a.Image;
                if (image === undefined) {
                    throw new Error(`Docker container ${args.container} not found.`);
                }
                updates.source = seSourceDockerContainer(args.container, image);
            }
            if (args.port !== "") {
                updates.port = Number.parseInt(args.port);
                if (updates.port === undefined) {
                    throw new Error(`Invalid port: ${args.port}`);
                }
            }
            if (args.dbPort !== "") {
                if (args.dbPort.toLowerCase() === "none") {
                    updates.dbPort = exports.PORT_NONE;
                }
                else {
                    updates.dbPort = Number.parseInt(args.dbPort);
                    if (updates.dbPort === undefined) {
                        throw new Error(`Invalid db-port: ${args.dbPort}`);
                    }
                }
            }
            yield this.updateConfig(terminal, args.instance, (x) => __awaiter(this, void 0, void 0, function* () { return updateInstance(x, updates); }), true);
        });
    }
    delete(instance, force) {
        const deleting = this.filter(instance, false);
        if (deleting.length === 0) {
            return;
        }
        if (deleting.length > 1 && !force) {
            throw Error('If you want to delete more than one instance you should specify "force" option.');
        }
        if (deleting === this.items) {
            this.items = [];
        }
        else {
            this.items = this.items.filter(x => !deleting.includes(x));
        }
        this.save();
    }
}
exports.SERegistry = SERegistry;
//# sourceMappingURL=registry.js.map