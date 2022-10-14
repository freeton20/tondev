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
exports.stopCommand = void 0;
const docker_1 = require("../../../core/docker");
const installer_1 = require("../installer");
exports.stopCommand = {
    name: "stop",
    title: "Stop ExtraTON DeBrowser",
    args: [],
    run(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, installer_1.controlInstances)((docker, def) => __awaiter(this, void 0, void 0, function* () {
                yield docker.shutdownContainer(terminal, def, docker_1.ContainerStatus.created);
            }));
        });
    },
};
//# sourceMappingURL=stop.js.map