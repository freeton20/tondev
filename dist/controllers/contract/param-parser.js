"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamParser = void 0;
class ParamParser {
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }
    static scalar(param, text) {
        const parser = new ParamParser(text);
        return parser.parseScalar(param);
    }
    static components(param, text) {
        const parser = new ParamParser(text);
        return parser.parseComponents(param);
    }
    hasMore() {
        return this.pos < this.text.length;
    }
    nextIs(test) {
        return this.hasMore() && test(this.text[this.pos]);
    }
    passIf(test) {
        if (this.nextIs(test)) {
            this.pos += 1;
            return true;
        }
        return false;
    }
    pass(c) {
        return this.passIf(x => x === c);
    }
    passWhile(test) {
        const savePos = this.pos;
        while (this.passIf(test)) {
        }
        return this.pos > savePos ? this.text.substring(savePos, this.pos) : undefined;
    }
    expectIf(test, param, expectMessage) {
        const passed = this.passWhile(test);
        if (passed !== undefined) {
            return passed;
        }
        throw this.error(`Param ${param.name} (${param.type}) expect ${expectMessage}`);
    }
    expect(test, param) {
        return this.expectIf(x => x === test, param, `"${test}"`);
    }
    parseScalar(param) {
        var _a;
        const isScalarChar = (x) => x !== "," && x !== ":" && x !== "[" && x !== "]";
        let quote = "";
        if (this.pass("\"")) {
            quote = "\"";
        }
        else if (this.pass("'")) {
            quote = "'";
        }
        if (quote !== "") {
            const value = (_a = this.passWhile(x => x !== quote)) !== null && _a !== void 0 ? _a : "";
            this.expect(quote, param);
            return value;
        }
        if (!this.nextIs(isScalarChar)) {
            return "";
        }
        return this.expectIf(isScalarChar, param, "value");
    }
    parseArray(param) {
        const item = JSON.parse(JSON.stringify(param));
        item.type = param.type.slice(0, -2);
        this.expect("[", param);
        const value = [];
        while (!this.pass("]")) {
            value.push(this.parseParam(item));
            this.pass(",");
        }
        return value;
    }
    parseParam(param) {
        if (param.type.endsWith("[]")) {
            return this.parseArray(param);
        }
        else {
            return this.parseScalar(param);
        }
    }
    parseComponents(param) {
        var _a;
        const isLetter = (x) => x.toLowerCase() !== x.toUpperCase();
        const isDigit = (x) => x >= "0" && x <= "9";
        const isIdent = (x) => isLetter(x) || isDigit(x) || x === "_";
        const components = (_a = param.components) !== null && _a !== void 0 ? _a : [];
        const value = {};
        while (this.hasMore()) {
            const name = this.expectIf(isIdent, param, "name");
            this.expect(":", param);
            const component = components.find(x => x.name.toLowerCase() === name.toLowerCase());
            if (!component) {
                throw this.error(`Unknown field ${name}`);
            }
            if (param.name in value) {
                throw new Error(`Field "${name}" already defined.`);
            }
            value[name] = this.parseParam(component);
            if (this.hasMore()) {
                this.expect(",", param);
            }
        }
        return value;
    }
    error(message) {
        const text = this.text;
        const pos = this.pos;
        const start = Math.max(pos - 12, 0);
        const end = Math.min(pos + 12, text.length);
        const prefix = start > 0 ? "..." : "";
        const suffix = end < text.length ? "..." : "";
        let context = `"${prefix}${text.substring(start, pos)} -> ${text.substring(pos, end)}${suffix}"`;
        return new Error(`${message} at ${context}`);
    }
}
exports.ParamParser = ParamParser;
//# sourceMappingURL=param-parser.js.map