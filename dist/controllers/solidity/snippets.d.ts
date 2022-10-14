export declare const BasicContract =
    "\n/**\n * This file was generated by EverDev.\n * EverDev is a part of EVER OS (see https://everos.dev).\n */\npragma ton-solidity >= 0.35.0;\npragma AbiHeader expire;\n\n// This is class that describes you smart contract.\ncontract {name} {\n    // Contract can have an instance variables.\n    // In this example instance variable `timestamp` is used to store the time of `constructor` or `touch`\n    // function call\n    uint32 public timestamp;\n\n    // Contract can have a `constructor` \u2013 function that will be called when contract will be deployed to the blockchain.\n    // In this example constructor adds current time to the instance variable.\n    // All contracts need call tvm.accept(); for succeeded deploy\n    constructor() public {\n        // Check that contract's public key is set\n        require(tvm.pubkey() != 0, 101);\n        // Check that message has signature (msg.pubkey() is not zero) and\n        // message is signed with the owner's private key\n        require(msg.pubkey() == tvm.pubkey(), 102);\n        // The current smart contract agrees to buy some gas to finish the\n        // current transaction. This actions required to process external\n        // messages, which bring no value (henceno gas) with themselves.\n        tvm.accept();\n\n        timestamp = now;\n    }\n\n    function renderHelloWorld () public pure returns (string) {\n        return 'helloWorld';\n    }\n\n    // Updates variable `timestamp` with current blockchain time.\n    function touch() external {\n        // Each function that accepts external message must check that\n        // message is correctly signed.\n        require(msg.pubkey() == tvm.pubkey(), 102);\n        // Tells to the TVM that we accept this message.\n        tvm.accept();\n        // Update timestamp\n        timestamp = now;\n    }\n\n    function sendValue(address dest, uint128 amount, bool bounce) public view {\n        require(msg.pubkey() == tvm.pubkey(), 102);\n        tvm.accept();\n        // It allows to make a transfer with arbitrary settings\n        dest.transfer(amount, bounce, 0);\n    }\n}\n"
