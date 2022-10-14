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
exports.interfacesCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
const request_1 = __importDefault(require("request"));
exports.interfacesCommand = {
    name: "interfaces",
    title: "Show list of implemented interfaces",
    args: [],
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, installer_1.controlInstances)((docker, def) => __awaiter(this, void 0, void 0, function* () {
                const containerInfo = yield docker.findContainerInfo(def.containerName);
                if (null !== containerInfo && docker_1.DevDocker.isRunning(containerInfo)) {
                    const url = `http://localhost:${containerInfo.Ports[0].PublicPort}/interfaces.json`;
                    (0, request_1.default)({ url, json: true }, function (error, response) {
                        if (null === error) {
                            terminal.log("Implemented interfaces:");
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
            }));
        });
    },
};
//# sourceMappingURL=interfaces.js.map