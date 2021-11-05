"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevDocker = exports.ContainerStatus = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const utils_1 = require("./utils");
var ContainerStatus;
(function (ContainerStatus) {
    ContainerStatus[ContainerStatus["missing"] = 0] = "missing";
    ContainerStatus[ContainerStatus["created"] = 1] = "created";
    ContainerStatus[ContainerStatus["running"] = 2] = "running";
})(ContainerStatus = exports.ContainerStatus || (exports.ContainerStatus = {}));
class DevDocker {
    constructor() {
        this.client = new dockerode_1.default();
        this.onStartupImages = null;
        this.onBeforePull = null;
        this._onStartupImagesPassed = false;
        this._images = null;
        this._containers = null;
    }
    dropCache() {
        this._images = null;
        this._containers = null;
    }
    async getImageInfos() {
        if (!this._images) {
            const images = await this.client.listImages({ all: true });
            this._images = images;
            if (!this._onStartupImagesPassed) {
                this._onStartupImagesPassed = true;
                if (this.onStartupImages) {
                    this.onStartupImages(images);
                }
            }
            this._images = images;
        }
        return this._images || [];
    }
    async getContainerInfos() {
        if (!this._containers) {
            this._containers = await this.client.listContainers({ all: true });
        }
        return this._containers || [];
    }
    async numericVersion() {
        const version = await this.client.version();
        return (0, utils_1.versionToNumber)(version.Version);
    }
    async removeImages(terminal, nameMatches, containersOnly) {
        // Stop and remove containers that belongs to images
        const containerInfos = (await this.getContainerInfos()).filter((info) => {
            return nameMatches.find(match => DevDocker.containersImageMatched(info, match));
        });
        for (let i = 0; i < containerInfos.length; i += 1) {
            const info = containerInfos[i];
            (0, utils_1.progress)(terminal, `Removing container [${DevDocker.containerTitle(info)}]`);
            const container = this.client.getContainer(info.Id);
            if (DevDocker.isRunning(info)) {
                await container.stop();
            }
            await container.remove();
            (0, utils_1.progressDone)(terminal);
        }
        if (containersOnly) {
            return;
        }
        // Remove images
        const imageInfos = (await this.getImageInfos()).filter((info) => {
            return nameMatches.find(match => DevDocker.imageHasMatchedName(info, match));
        });
        for (let i = 0; i < imageInfos.length; i += 1) {
            const info = imageInfos[i];
            (0, utils_1.progress)(terminal, `Removing image [${DevDocker.imageTitle(info)}]`);
            const image = this.client.getImage(info.Id);
            await image.remove();
            (0, utils_1.progressDone)(terminal);
        }
    }
    async pull(terminal, repoTag) {
        if (this.onBeforePull) {
            await this.onBeforePull(repoTag);
        }
        const client = this.client;
        const title = `Pulling [${repoTag}]`;
        (0, utils_1.progress)(terminal, title);
        const image = await new Promise((resolve, reject) => {
            client.pull(repoTag, {}, function (err, stream) {
                if (!stream) {
                    reject(err);
                    return;
                }
                client.modem.followProgress(stream, onFinished, onProgress);
                function onFinished(_err, output) {
                    resolve(output);
                }
                function onProgress(event) {
                    (0, utils_1.progressLine)(terminal, `${title}... ${event.progress || ""}`);
                }
            });
        });
        (0, utils_1.progress)(terminal, title);
        (0, utils_1.progressDone)(terminal);
        return image;
    }
    async findImageInfo(name) {
        return (await this.getImageInfos()).find(x => DevDocker.imageHasMatchedName(x, name)) || null;
    }
    async findContainerInfo(name) {
        return (await this.getContainerInfos()).find(x => DevDocker.hasName(x, name)) || null;
    }
    async shutdownContainer(terminal, def, downTo) {
        const info = await this.findContainerInfo(def.containerName);
        if (!info) {
            return;
        }
        if (downTo < ContainerStatus.running && DevDocker.isRunning(info)) {
            (0, utils_1.progress)(terminal, `Stopping [${def.containerName}]`);
            await this.client.getContainer(info.Id).stop();
            (0, utils_1.progressDone)(terminal);
            this.dropCache();
        }
        if (downTo < ContainerStatus.created) {
            (0, utils_1.progress)(terminal, `Removing [${def.containerName}]`);
            await this.client.getContainer(info.Id).remove();
            (0, utils_1.progressDone)(terminal);
            this.dropCache();
        }
    }
    async ensureImage(terminal, requiredImage) {
        if (!(await this.findImageInfo(requiredImage))) {
            await this.pull(terminal, requiredImage);
            this.dropCache();
        }
    }
    async startupContainer(terminal, def, upTo) {
        let info = await this.findContainerInfo(def.containerName);
        let requiredImage = def.requiredImage;
        if (requiredImage === "") {
            if (info === null) {
                throw Error(`Container ${def.containerName} doesn't exists.`);
            }
            requiredImage = info.Image;
        }
        await this.ensureImage(terminal, requiredImage);
        if (upTo >= ContainerStatus.created && !info) {
            (0, utils_1.progress)(terminal, `Creating ${def.containerName}`);
            await def.createContainer(this);
            (0, utils_1.progressDone)(terminal);
            this.dropCache();
            info = await this.findContainerInfo(def.containerName);
        }
        if (upTo >= ContainerStatus.running && info && !DevDocker.isRunning(info)) {
            (0, utils_1.progress)(terminal, `Starting ${def.containerName}`);
            await this.client.getContainer(info.Id).start();
            (0, utils_1.progressDone)(terminal);
            this.dropCache();
        }
    }
    async shutdownContainers(terminal, defs, downTo) {
        for (let i = 0; i < defs.length; i += 1) {
            await this.shutdownContainer(terminal, defs[i], downTo);
        }
    }
    async startupContainers(terminal, defs, upTo) {
        for (let i = 0; i < defs.length; i += 1) {
            await this.startupContainer(terminal, defs[i], upTo);
        }
    }
    async ensureRunning(terminal, def) {
        await this.startupContainer(terminal, def, ContainerStatus.running);
        const info = await this.findContainerInfo(def.containerName);
        return this.client.getContainer((info && info.Id) || def.containerName);
    }
    static hasName(container, name) {
        const nameToFind = `/${name}`.toLowerCase();
        return !!(container.Names || []).find(n => n.toLowerCase() === nameToFind);
    }
    static imageTitle(info) {
        return DevDocker.imageNames(info)[0] || info.Id;
    }
    static containerTitle(info) {
        return info.Names.map(name => name.startsWith("/") ? name.substr(1) : name).join(";");
    }
    // if match specified with tag compare exactly
    // if match specified without tag compare untagged names
    static imageNameMatched(imageName, match) {
        imageName = imageName.toLowerCase();
        match = match.toLowerCase();
        const matchParts = match.split(":");
        if (matchParts.length > 1) {
            return imageName === match;
        }
        const imageParts = imageName.split(":");
        return imageParts[0] === matchParts[0];
    }
    static imageNames(info) {
        return [
            ...(info.RepoTags || []),
            ...(info.RepoDigests || []).map((digest) => {
                return digest.split("@").join(":");
            }),
        ];
    }
    static imageHasMatchedName(info, match) {
        return !!DevDocker.imageNames(info).find(name => this.imageNameMatched(name, match));
    }
    static isRunning(info) {
        return !!info && info.State.toLowerCase() === "running";
    }
    static containersImageMatched(info, match) {
        return this.imageNameMatched(info.Image, match);
    }
}
exports.DevDocker = DevDocker;
//# sourceMappingURL=docker.js.map