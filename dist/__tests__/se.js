"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
const controllers_1 = require("../controllers");
const utils_1 = require("../core/utils");
beforeAll(init_1.initTests);
afterAll(init_1.doneTests);
test("Use custom docker image", async () => {
    await (0, controllers_1.runCommand)(utils_1.consoleTerminal, "se set", {
        instance: "se1",
        image: "tonlabs/local-node:0.28.1",
    });
});
//# sourceMappingURL=se.js.map