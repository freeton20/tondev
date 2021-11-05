"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApp = void 0;
exports.BaseApp = {
    index: `

const {TonClient} = require("@tonclient/core");
const {libNode} = require("@tonclient/lib-node");

TonClient.useBinaryLibrary(libNode);
(async () => {
    const client = new TonClient({
        network: {
            endpoints: ["http://localhost"]
        }
    });
    try {
        await main(client);
    } catch (err) {
        console.error(err);
    }
    client.close();
})();

async function main(client) {
    console.log((await client.client.version()).version);
}

`,
    package: `
{
    "dependencies": {
        "@tonclient/core": "^1",
        "@tonclient/lib-node": "^1"
    }
}
`,
};
//# sourceMappingURL=snippets.js.map