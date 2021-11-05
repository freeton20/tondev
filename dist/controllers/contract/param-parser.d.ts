import { AbiParam } from "@tonclient/core";
export declare class ParamParser {
    text: string;
    pos: number;
    private constructor();
    static scalar(param: AbiParam, text: string): any;
    static components(param: AbiParam, text: string): any;
    hasMore(): boolean;
    nextIs(test: (c: string) => boolean): boolean;
    passIf(test: (c: string) => boolean): boolean;
    pass(c: string): boolean;
    passWhile(test: (c: string) => boolean): string | undefined;
    expectIf(test: (c: string) => boolean, param: AbiParam, expectMessage: string): string;
    expect(test: string, param: AbiParam): string;
    parseScalar(param: AbiParam): any;
    parseArray(param: AbiParam): any[];
    parseParam(param: AbiParam): any;
    parseComponents(param: AbiParam): {
        [name: string]: any;
    };
    private error;
}
//# sourceMappingURL=param-parser.d.ts.map