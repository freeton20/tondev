"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
const __1 = require("..");
const signer_1 = require("../controllers/signer");
const registry_1 = require("../controllers/signer/registry");
const core_1 = require("@tonclient/core");
beforeAll(init_1.initTests);
afterAll(init_1.doneTests);
test("Add signer with secret key", async () => {
    const keys = await core_1.TonClient.default.crypto.generate_random_sign_keys();
    await signer_1.signerAddCommand.run(__1.consoleTerminal, {
        name: "from_secret_key",
        secret: keys.secret,
    });
    expect(new registry_1.SignerRegistry().get("from_secret_key").keys).toEqual(keys);
});
test("Add signer with keys file", async () => {
    const keys = await core_1.TonClient.default.crypto.generate_random_sign_keys();
    const keysPath = (0, init_1.writeTempJson)("keys.json", keys);
    await signer_1.signerAddCommand.run(__1.consoleTerminal, {
        name: "from_keys_file",
        secret: keysPath,
    });
    expect(new registry_1.SignerRegistry().get("from_keys_file").keys).toEqual(keys);
});
//# sourceMappingURL=signer.js.map