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
exports.NetworkGiver = void 0;
const appkit_1 = require("@eversdk/appkit");
const core_1 = require("@eversdk/core");
const known_contracts_1 = require("../../core/known-contracts");
const registry_1 = require("../signer/registry");
const utils_1 = require("../../core/utils");
function giverV2Send(giver, address, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield giver.run("sendTransaction", {
            dest: address,
            value: value,
            bounce: false,
        });
    });
}
function giverV1Send(giver, address, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield giver.run("sendGrams", {
            dest: address,
            amount: value,
            bounce: false,
        });
    });
}
function multisigSend(giver, address, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield giver.run("sendTransaction", {
            dest: address,
            value: value,
            bounce: false,
            flags: 1,
            payload: "",
        });
    });
}
const seGiverKeys = {
    public: "2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16",
    secret: "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
};
const seGiverKeysTvc = "te6ccgECGgEAA9sAAgE0BgEBAcACAgPPIAUDAQHeBAAD0CAAQdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIm/wD0pCAiwAGS9KDhiu1TWDD0oQkHAQr0pCD0oQgAAAIBIAwKAfz/fyHtRNAg10nCAZ/T/9MA9AX4an/4Yfhm+GKOG/QFbfhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLTAAGOEoECANcYIPkBWPhCIPhl+RDyqN4j+EL4RSBukjBw3rry4GUh0z/THzQx+CMhAb7yuSH5ACD4SoEBAPQOIJEx3rMLAE7y4Gb4ACH4SiIBVQHIyz9ZgQEA9EP4aiMEXwTTHwHwAfhHbpLyPN4CASASDQIBWBEOAQm46Jj8UA8B/vhBbo4S7UTQ0//TAPQF+Gp/+GH4Zvhi3tFwbW8C+EqBAQD0hpUB1ws/f5NwcHDikSCONyMjI28CbyLIIs8L/yHPCz8xMQFvIiGkA1mAIPRDbwI0IvhKgQEA9HyVAdcLP3+TcHBw4gI1MzHoXwPIghB3RMfighCAAAAAsc8LHyEQAKJvIgLLH/QAyIJYYAAAAAAAAAAAAAAAAM8LZoEDmCLPMQG5lnHPQCHPF5Vxz0EhzeIgyXH7AFswwP+OEvhCyMv/+EbPCwD4SgH0AMntVN5/+GcAxbkWq+f/CC3Rxt2omgQa6ThAM/p/+mAegL8NT/8MPwzfDFHDfoCtvw1OADAIHoHeV7rhf/8MTh8Mbh8Mz/8MPFvfCNJeRnJuPwzcXwAaPwhZGX//CNnhYB8JQD6AGT2qj/8M8AIBIBUTAde7Fe+TX4QW6OEu1E0NP/0wD0Bfhqf/hh+Gb4Yt76QNcNf5XU0dDTf9/XDACV1NHQ0gDf0SIiInPIcc8LASLPCgBzz0AkzxYj+gKAac9Acs9AIMki+wBfBfhKgQEA9IaVAdcLP3+TcHBw4pEggUAJKOLfgjIgG7n/hKIwEhAYEBAPRbMDH4at4i+EqBAQD0fJUB1ws/f5NwcHDiAjUzMehfA18D+ELIy//4Rs8LAPhKAfQAye1Uf/hnAgEgFxYAx7jkYYdfCC3Rwl2omhp/+mAegL8NT/8MPwzfDFvamj8IXwikDdJGDhvXXlwMvwAfCFkZf/8I2eFgHwlAPoAZPaqfAeQfYIQaHaPdqn4ARh8IWRl//wjZ4WAfCUA+gBk9qo//DPACAtoZGAAtr4QsjL//hGzwsA+EoB9ADJ7VT4D/IAgAdacCHHAJ0i0HPXIdcLAMABkJDi4CHXDR+S8jzhUxHAAJDgwQMighD////9vLGS8jzgAfAB+EdukvI83o";
class NetworkGiver {
    constructor(contract, client, address, signer, info, send) {
        this.contract = contract;
        this.address = address;
        this.info = info;
        this.send = send;
        this.value = info.value;
        this.name = info.name;
        this.account = new appkit_1.Account(contract, {
            client,
            address,
            signer,
        });
    }
    static create(client, info) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const signerName = (_a = (info.signer || new registry_1.SignerRegistry().default)) !== null && _a !== void 0 ? _a : "";
            const signer = signerName !== ""
                ? yield new registry_1.SignerRegistry().resolveSigner(signerName, {
                    useNoneForEmptyName: true,
                })
                : (0, core_1.signerKeys)(seGiverKeys);
            const address = info.address !== ""
                ? info.address
                : (yield client.abi.encode_message({
                    abi: (0, core_1.abiContract)(known_contracts_1.KnownContracts.GiverV2.abi),
                    deploy_set: {
                        tvc: seGiverKeysTvc,
                    },
                    signer,
                })).address;
            let contract;
            let send;
            if (info.name !== undefined && info.name !== "auto") {
                contract = yield (0, known_contracts_1.knownContractByName)(info.name);
            }
            else {
                contract = yield (0, known_contracts_1.knownContractFromAddress)(client, "Giver", address);
            }
            if (contract === known_contracts_1.KnownContracts.GiverV1) {
                send = giverV1Send;
            }
            else if (contract === known_contracts_1.KnownContracts.GiverV2) {
                send = giverV2Send;
            }
            else if (contract === known_contracts_1.KnownContracts.GiverV3) {
                send = giverV2Send;
            }
            else if (contract === known_contracts_1.KnownContracts.SetcodeMultisigWallet) {
                send = multisigSend;
            }
            else if (contract === known_contracts_1.KnownContracts.SafeMultisigWallet) {
                send = multisigSend;
            }
            else {
                throw new Error(`Contract ${contract.name} can't be used as a giver.`);
            }
            return new NetworkGiver(contract, client, address, signer, info, send);
        });
    }
    sendTo(address, value) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const valueToSend = (_a = this.value) !== null && _a !== void 0 ? _a : value;
            try {
                yield this.send(this.account, address, valueToSend);
            }
            catch (error) {
                const message = `Giver can't send ${(0, utils_1.formatTokens)(valueToSend)} to the ${address}`;
                const giver = `Contract: ${this.info.name}\nAddress:  ${this.address}\nSigner:   ${this.info.signer}`;
                throw new Error(`${message}: ${error.message}\n\nPlease check giver configuration:\n${giver}`);
            }
        });
    }
}
exports.NetworkGiver = NetworkGiver;
//# sourceMappingURL=giver.js.map