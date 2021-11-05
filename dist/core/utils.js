"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = exports.isHex = exports.resolveContract = exports.breakWords = exports.reduceBase64String = exports.parseNanoTokens = exports.parseNumber = exports.formatTable = exports.userIdentifier = exports.httpsGetJson = exports.progressDone = exports.progress = exports.progressLine = exports.compareVersionsDescending = exports.compareVersions = exports.versionToNumber = exports.StringTerminal = exports.nullTerminal = exports.consoleTerminal = exports.uniqueFilePath = exports.run = exports.downloadFromBinaries = exports.downloadFromGithub = exports.writeJsonFile = exports.writeTextFile = exports.formatTokens = exports.loadBinaryVersions = exports.ellipsisString = exports.changeExt = exports.executableName = void 0;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const https = __importStar(require("https"));
const zlib = __importStar(require("zlib"));
const unzip = __importStar(require("unzip-stream"));
const request_1 = __importDefault(require("request"));
function executableName(name) {
    return `${name}${os.platform() === "win32" ? ".exe" : ""}`;
}
exports.executableName = executableName;
function changeExt(path, newExt) {
    return path.replace(/\.[^/.]+$/, newExt);
}
exports.changeExt = changeExt;
function ellipsisString(xs) {
    return (xs.length < 10 ? xs : [...xs.slice(0, 10), '...']).join(', ');
}
exports.ellipsisString = ellipsisString;
async function loadBinaryVersions(name) {
    const info = await httpsGetJson(`https://binaries.tonlabs.io/${name}.json`);
    const versions = info[name].sort(compareVersions).reverse();
    return versions;
}
exports.loadBinaryVersions = loadBinaryVersions;
function formatTokens(nanoTokens) {
    const token = BigInt(1000000000);
    const bigNano = BigInt(nanoTokens);
    const tokens = Number(bigNano / token) + Number(bigNano % token) / Number(token);
    const tokensString = tokens < 1 ? tokens.toString() : `≈ ${Math.round(tokens)}`;
    return `${tokensString} tokens (${bigNano} nano)`;
}
exports.formatTokens = formatTokens;
function writeTextFile(p, s) {
    const folderPath = path.dirname(p);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(p, s);
}
exports.writeTextFile = writeTextFile;
function writeJsonFile(p, v) {
    writeTextFile(p, JSON.stringify(v, undefined, "    "));
}
exports.writeJsonFile = writeJsonFile;
async function installGlobally(dstPath, version, terminal) {
    const binDir = path.dirname(dstPath);
    const [name, ext] = path.basename(dstPath).split(".");
    try {
        writeJsonFile(`${binDir}/package.json`, {
            name: name,
            version,
            bin: `./${name}${ext ? "." + ext : ""}`,
        });
        await run("npm", ["install", "-g"], { cwd: binDir }, terminal);
    }
    catch (err) {
        terminal.writeError(err);
        throw Error(`An error occurred while trying to install ${name} globally.
Make sure you can execute 'npm i <package> -g' without using sudo and try again`);
    }
}
function downloadAndUnzip(dst, url, terminal) {
    return new Promise((resolve, reject) => {
        (0, request_1.default)(url)
            .on("data", _ => {
            terminal.write(".");
        })
            .on("error", reject) // http protocol errors
            .pipe(unzip
            .Extract({ path: dst })
            .on("error", reject) // unzip errors
            .on("close", resolve));
    });
}
async function downloadFromGithub(terminal, srcUrl, dstPath) {
    terminal.write(`Downloading from ${srcUrl}`);
    if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath, { recursive: true });
    }
    await downloadAndUnzip(dstPath, srcUrl, terminal);
    terminal.write("\n");
}
exports.downloadFromGithub = downloadFromGithub;
function downloadAndGunzip(dest, url, terminal) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Download from ${url} failed with ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            let file = fs.createWriteStream(dest, { flags: "w" });
            let opened = false;
            const failed = (err) => {
                if (file) {
                    file.close();
                    file = null;
                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };
            const unzip = zlib.createGunzip();
            unzip.pipe(file);
            response.pipe(unzip);
            response.on("data", _ => {
                terminal.write(".");
            });
            request.on("error", err => {
                failed(err);
            });
            file.on("finish", () => {
                if (opened && file) {
                    resolve();
                }
            });
            file.on("open", () => {
                opened = true;
            });
            file.on("error", err => {
                if (err.code === "EEXIST" && file) {
                    file.close();
                    reject("File already exists");
                }
                else {
                    failed(err);
                }
            });
        });
    });
}
async function downloadFromBinaries(terminal, dstPath, src, options) {
    src = src.replace("{p}", os.platform());
    const srcExt = path.extname(src).toLowerCase();
    const srcUrl = `https://binaries.tonlabs.io/${src}`;
    terminal.write(`Downloading from ${srcUrl}`);
    const dstDir = path.dirname(dstPath);
    if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
    }
    if (srcExt === ".zip") {
        await downloadAndUnzip(dstDir, srcUrl, terminal);
    }
    else if (srcExt === ".gz") {
        await downloadAndGunzip(dstPath, srcUrl, terminal);
        if (path.extname(dstPath) === ".tar") {
            await run("tar", ["xvf", dstPath], { cwd: path.dirname(dstPath) }, terminal);
            fs.unlink(dstPath, () => {
            });
        }
    }
    else {
        throw Error(`Unexpected binary file extension: ${srcExt}`);
    }
    if ((options === null || options === void 0 ? void 0 : options.executable) && os.platform() !== "win32") {
        if (options === null || options === void 0 ? void 0 : options.adjustedPath) {
            const dir = path.dirname(options.adjustedPath);
            fs.readdirSync(dir)
                .map(filename => path.resolve(dir, filename))
                .filter(filename => !fs.lstatSync(filename).isDirectory())
                .forEach(filename => fs.chmodSync(filename, 0o755));
        }
        else {
            fs.chmodSync(dstPath, 0o755);
        }
        // Without pause on Fedora 32 Linux always leads to an error: spawn ETXTBSY
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (options === null || options === void 0 ? void 0 : options.globally) {
        if (!options.version) {
            throw Error("Version required to install package");
        }
        await installGlobally(dstPath, options.version, terminal).catch(err => {
            fs.unlink(dstPath, () => {
            });
            throw err;
        });
    }
    terminal.write("\n");
}
exports.downloadFromBinaries = downloadFromBinaries;
function run(name, args, options, terminal) {
    return new Promise((resolve, reject) => {
        try {
            const { cwd } = options;
            if (cwd && !fs.existsSync(cwd)) {
                throw Error(`Directory not exists: ${cwd}`);
            }
            const isWindows = os.platform() === "win32";
            const spawned = isWindows
                ? (0, child_process_1.spawn)("cmd.exe", ["/c", name].concat(args), {
                    env: process.env,
                    ...options,
                })
                : (0, child_process_1.spawn)(name, args, {
                    env: process.env,
                    ...options,
                });
            const output = [];
            spawned.stdout.on("data", function (data) {
                const text = data.toString();
                output.push(text);
                terminal.log(text);
            });
            spawned.stderr.on("data", data => {
                const text = data.toString();
                terminal.writeError(text);
            });
            spawned.on("error", err => {
                reject(err);
            });
            spawned.on("close", code => {
                if (code === 0) {
                    resolve(output.join(""));
                }
                else {
                    reject(`${name} failed`);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.run = run;
function uniqueFilePath(folderPath, namePattern) {
    let index = 0;
    while (true) {
        const filePath = path.resolve(folderPath, namePattern.replace("{}", index === 0 ? "" : index.toString()));
        if (!fs.existsSync(filePath)) {
            return filePath;
        }
        index += 1;
    }
}
exports.uniqueFilePath = uniqueFilePath;
exports.consoleTerminal = {
    write(text) {
        process.stdout.write(text);
    },
    writeError(text) {
        process.stderr.write(text);
    },
    log(...args) {
        console.log(...args);
    },
};
exports.nullTerminal = {
    write(_text) {
    },
    writeError(_text) {
    },
    log(..._args) {
    },
};
class StringTerminal {
    constructor() {
        this.stdout = "";
        this.stderr = "";
    }
    log(...args) {
        this.stdout += args.map(x => `${x}`).join(" ");
        this.stdout += "\r\n";
    }
    write(text) {
        this.stdout += text;
    }
    writeError(text) {
        this.stderr += text;
    }
}
exports.StringTerminal = StringTerminal;
function versionToNumber(s) {
    if (s.toLowerCase() === "latest") {
        return 1000000000;
    }
    const parts = `${s || ""}`
        .split(".")
        .map(x => Number.parseInt(x))
        .slice(0, 3);
    while (parts.length < 3) {
        parts.push(0);
    }
    return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
}
exports.versionToNumber = versionToNumber;
function compareVersions(a, b) {
    const an = versionToNumber(a);
    const bn = versionToNumber(b);
    return an < bn ? -1 : (an === bn ? 0 : 1);
}
exports.compareVersions = compareVersions;
function compareVersionsDescending(a, b) {
    const an = versionToNumber(a);
    const bn = versionToNumber(b);
    return an > bn ? -1 : (an === bn ? 0 : 1);
}
exports.compareVersionsDescending = compareVersionsDescending;
let _progressLine = "";
function progressLine(terminal, line) {
    terminal.write(`\r${line}`);
    const extra = _progressLine.length - line.length;
    if (extra > 0) {
        terminal.write(" ".repeat(extra) + "\b".repeat(extra));
    }
    _progressLine = line;
}
exports.progressLine = progressLine;
function progress(terminal, info) {
    progressLine(terminal, `${info}...`);
}
exports.progress = progress;
function progressDone(terminal) {
    terminal.log(" ✓");
    _progressLine = "";
}
exports.progressDone = progressDone;
function httpsGetJson(url) {
    return new Promise((resolve, reject) => {
        const tryUrl = (url) => {
            https
                .get(url, function (res) {
                let body = "";
                res.on("data", function (chunk) {
                    body += chunk;
                });
                res.on("end", function () {
                    if (res.statusCode === 301) {
                        const redirectUrl = res.headers["location"];
                        if (redirectUrl) {
                            tryUrl(redirectUrl);
                        }
                        else {
                            reject(new Error("Redirect response has no `location` header."));
                        }
                        return;
                    }
                    const response = JSON.parse(body);
                    resolve(response);
                });
            })
                .on("error", error => {
                reject(error);
            });
        };
        tryUrl(url);
    });
}
exports.httpsGetJson = httpsGetJson;
function toIdentifier(s) {
    let identifier = "";
    for (let i = 0; i < s.length; i += 1) {
        const c = s[i];
        const isLetter = c.toLowerCase() !== c.toUpperCase();
        const isDigit = !isLetter && "0123456789".includes(c);
        if (isLetter || isDigit) {
            identifier += c;
        }
    }
    return identifier;
}
function userIdentifier() {
    return toIdentifier(os.userInfo().username).toLowerCase();
}
exports.userIdentifier = userIdentifier;
function toString(value) {
    return value === null || value === undefined ? "" : value.toString();
}
function formatTable(table, options) {
    var _a, _b, _c;
    const headerSeparator = (_a = options === null || options === void 0 ? void 0 : options.headerSeparator) !== null && _a !== void 0 ? _a : false;
    const multilineSeparator = (_b = options === null || options === void 0 ? void 0 : options.multilineSeparator) !== null && _b !== void 0 ? _b : false;
    const multilineIndent = (_c = options === null || options === void 0 ? void 0 : options.multilineIndent) !== null && _c !== void 0 ? _c : "  ";
    const rows = table.map(row => row.map(cell => toString(cell).split("\n")));
    const widths = [];
    const isEmpty = [];
    const updateWidth = (cell, i, rowIndex) => {
        while (widths.length <= i) {
            widths.push(0);
            isEmpty.push(true);
        }
        for (const line of cell) {
            const width = line.length;
            widths[i] = Math.max(widths[i], width);
            const isHeader = headerSeparator && rowIndex === 0;
            if (!isHeader && (width > 0)) {
                isEmpty[i] = false;
            }
        }
    };
    rows.forEach((row, ri) => row.forEach((cell, vi) => updateWidth(cell, vi, ri)));
    const formatValue = (value, ci) => value.padEnd(widths[ci]);
    const formatRowLine = (rowLine) => rowLine.map(formatValue).filter((_, i) => !isEmpty[i]).join("  ").trimEnd();
    const formatCellLine = (cell, line) => {
        if (line >= cell.length) {
            return "";
        }
        return `${line > 0 ? multilineIndent : ""}${cell[line]}`;
    };
    const lines = [];
    const hasMultilines = rows.find(r => r.find(c => c.length > 0)) !== undefined;
    const firstDataRowIndex = headerSeparator ? 1 : 0;
    rows.forEach((row, rowIndex) => {
        for (let line = 0; row.find(x => line < x.length); line += 1) {
            if (multilineSeparator && hasMultilines && rowIndex > firstDataRowIndex && line === 0) {
                lines.push("");
            }
            lines.push(formatRowLine(row.map(x => formatCellLine(x, line))));
        }
    });
    if (headerSeparator) {
        const separator = formatRowLine(widths.map(x => "-".repeat(x)));
        lines.splice(1, 0, separator);
    }
    return lines.join("\n");
}
exports.formatTable = formatTable;
function parseNumber(s) {
    if (s === null || s === undefined || s === "") {
        return undefined;
    }
    const n = Number(s);
    if (Number.isNaN(n)) {
        throw Error(`Invalid number: ${s}`);
    }
    return n;
}
exports.parseNumber = parseNumber;
function parseNanoTokens(s) {
    if (s === null || s === undefined || s === "") {
        return undefined;
    }
    const nanos = s.endsWith("T") || s.endsWith("t")
        ? `${s.slice(0, s.length - 1)}000000000`
        : s;
    const nanoTokens = Number(nanos);
    if (Number.isNaN(nanoTokens)) {
        throw Error(`Invalid token value: ${s}`);
    }
    return nanoTokens;
}
exports.parseNanoTokens = parseNanoTokens;
function reduceBase64String(s) {
    if (s === undefined) {
        return undefined;
    }
    if (s.length < 80) {
        return s;
    }
    const bytes = Buffer.from(s, "base64");
    return `${s.slice(0, 30)} ... ${s.slice(-30)} (${bytes.length} bytes)`;
}
exports.reduceBase64String = reduceBase64String;
function breakWords(s, maxLen = 80) {
    let result = "";
    for (const sourceLine of s.split("\n")) {
        const words = sourceLine.split(" ");
        let line = "";
        words.forEach((w) => {
            if (line.length + w.length > maxLen) {
                if (result !== "") {
                    result += "\n";
                }
                result += line;
                line = "";
            }
            if (line !== "") {
                line += " ";
            }
            line += w;
        });
        if (line !== "") {
            if (result !== "") {
                result += "\n";
            }
            result += line;
        }
    }
    return result;
}
exports.breakWords = breakWords;
function findExisting(paths) {
    return paths.find(x => fs.existsSync(x));
}
function resolveContract(filePath) {
    var _a;
    filePath = filePath.trim();
    const lowered = filePath.toLowerCase();
    let basePath;
    if (lowered.endsWith(".tvc") || lowered.endsWith(".abi") || lowered.endsWith(".sol")) {
        basePath = filePath.slice(0, -4);
    }
    else if (lowered.endsWith(".abi.json")) {
        basePath = filePath.slice(0, -9);
    }
    else {
        basePath = filePath;
    }
    const tvcPath = findExisting([`${basePath}.tvc`]);
    const abiPath = (_a = findExisting([`${basePath}.abi.json`, `${basePath}.abi`])) !== null && _a !== void 0 ? _a : "";
    const tvc = tvcPath ? fs.readFileSync(tvcPath).toString("base64") : undefined;
    const abi = abiPath !== "" ? JSON.parse(fs.readFileSync(abiPath, "utf8")) : undefined;
    if (!abi) {
        throw new Error("ABI file missing.");
    }
    return {
        package: {
            abi,
            tvc,
        },
        abiPath,
        tvcPath,
    };
}
exports.resolveContract = resolveContract;
function isHex(s) {
    for (let i = 0; i < s.length; i += 1) {
        if (!"0123456789ABCDEFabcdef".includes(s[i])) {
            return false;
        }
    }
    return true;
}
exports.isHex = isHex;
function resolvePath(s) {
    return s.startsWith("~/")
        ? `${os.homedir()}${s.substr(1)}`
        : path.resolve(process.cwd(), s);
}
exports.resolvePath = resolvePath;
//# sourceMappingURL=utils.js.map