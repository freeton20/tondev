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
    getImageInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._images) {
                const images = yield this.client.listImages({ all: true });
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
        });
    }
    getContainerInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._containers) {
                this._containers = yield this.client.listContainers({ all: true });
            }
            return this._containers || [];
        });
    }
    numericVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield this.client.version();
            return (0, utils_1.versionToNumber)(version.Version);
        });
    }
    removeImages(terminal, nameMatches, containersOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            // Stop and remove containers that belongs to images
            const containerInfos = (yield this.getContainerInfos()).filter(info => {
                return nameMatches.find(match => DevDocker.containersImageMatched(info, match));
            });
            for (let i = 0; i < containerInfos.length; i += 1) {
                const info = containerInfos[i];
                (0, utils_1.progress)(terminal, `Removing container [${DevDocker.containerTitle(info)}]`);
                const container = this.client.getContainer(info.Id);
                if (DevDocker.isRunning(info)) {
                    yield container.stop();
                }
                yield container.remove();
                (0, utils_1.progressDone)(terminal);
            }
            if (containersOnly) {
                return;
            }
            // Remove images
            const imageInfos = (yield this.getImageInfos()).filter(info => {
                return nameMatches.find(match => DevDocker.imageHasMatchedName(info, match));
            });
            for (let i = 0; i < imageInfos.length; i += 1) {
                const info = imageInfos[i];
                (0, utils_1.progress)(terminal, `Removing image [${DevDocker.imageTitle(info)}]`);
                const image = this.client.getImage(info.Id);
                yield image.remove();
                (0, utils_1.progressDone)(terminal);
            }
        });
    }
    pull(terminal, repoTag) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.onBeforePull) {
                yield this.onBeforePull(repoTag);
            }
            const client = this.client;
            const title = `Pulling [${repoTag}]`;
            (0, utils_1.progress)(terminal, title);
            const image = yield new Promise((resolve, reject) => {
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
        });
    }
    findImageInfo(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield this.getImageInfos()).find(x => DevDocker.imageHasMatchedName(x, name)) || null);
        });
    }
    findContainerInfo(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield this.getContainerInfos()).find(x => DevDocker.hasName(x, name)) || null);
        });
    }
    shutdownContainer(terminal, def, downTo) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.findContainerInfo(def.containerName);
            if (!info) {
                return;
            }
            if (downTo < ContainerStatus.running && DevDocker.isRunning(info)) {
                (0, utils_1.progress)(terminal, `Stopping [${def.containerName}]`);
                yield this.client.getContainer(info.Id).stop();
                (0, utils_1.progressDone)(terminal);
                this.dropCache();
            }
            if (downTo < ContainerStatus.created) {
                (0, utils_1.progress)(terminal, `Removing [${def.containerName}]`);
                yield this.client.getContainer(info.Id).remove();
                (0, utils_1.progressDone)(terminal);
                this.dropCache();
            }
        });
    }
    ensureImage(terminal, requiredImage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.findImageInfo(requiredImage))) {
                yield this.pull(terminal, requiredImage);
                this.dropCache();
            }
        });
    }
    startupContainer(terminal, def, upTo) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = yield this.findContainerInfo(def.containerName);
            let requiredImage = def.requiredImage;
            if (requiredImage === "") {
                if (info === null) {
                    throw Error(`Container ${def.containerName} doesn't exists.`);
                }
                requiredImage = info.Image;
            }
            yield this.ensureImage(terminal, requiredImage);
            if (upTo >= ContainerStatus.created && !info) {
                (0, utils_1.progress)(terminal, `Creating ${def.containerName}`);
                yield def.createContainer(this);
                (0, utils_1.progressDone)(terminal);
                this.dropCache();
                info = yield this.findContainerInfo(def.containerName);
            }
            if (upTo >= ContainerStatus.running &&
                info &&
                !DevDocker.isRunning(info)) {
                (0, utils_1.progress)(terminal, `Starting ${def.containerName}`);
                yield this.client.getContainer(info.Id).start();
                (0, utils_1.progressDone)(terminal);
                this.dropCache();
            }
        });
    }
    shutdownContainers(terminal, defs, downTo) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < defs.length; i += 1) {
                yield this.shutdownContainer(terminal, defs[i], downTo);
            }
        });
    }
    startupContainers(terminal, defs, upTo) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < defs.length; i += 1) {
                yield this.startupContainer(terminal, defs[i], upTo);
            }
        });
    }
    ensureRunning(terminal, def) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.startupContainer(terminal, def, ContainerStatus.running);
            const info = yield this.findContainerInfo(def.containerName);
            return this.client.getContainer((info && info.Id) || def.containerName);
        });
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
            ...(info.RepoDigests || []).map(digest => {
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