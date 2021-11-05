import Dockerode, { Container, ContainerInfo, Image, ImageInfo } from "dockerode";
import { Terminal } from ".";
export declare enum ContainerStatus {
    missing = 0,
    created = 1,
    running = 2
}
export interface ContainerDef {
    requiredImage: string;
    containerName: string;
    createContainer(docker: DevDocker): Promise<Dockerode.Container>;
}
declare class DevDocker {
    client: Dockerode;
    _images: ImageInfo[] | null;
    _containers: ContainerInfo[] | null;
    _onStartupImagesPassed: boolean;
    onStartupImages: ((images: ImageInfo[]) => void) | null;
    onBeforePull: ((repoTag: string) => Promise<void>) | null;
    constructor();
    dropCache(): void;
    getImageInfos(): Promise<ImageInfo[]>;
    getContainerInfos(): Promise<ContainerInfo[]>;
    numericVersion(): Promise<number>;
    removeImages(terminal: Terminal, nameMatches: string[], containersOnly: boolean): Promise<void>;
    pull(terminal: Terminal, repoTag: string): Promise<Image>;
    findImageInfo(name: string): Promise<(ImageInfo | null)>;
    findContainerInfo(name: string): Promise<ContainerInfo | null>;
    shutdownContainer(terminal: Terminal, def: ContainerDef, downTo: ContainerStatus): Promise<void>;
    ensureImage(terminal: Terminal, requiredImage: string): Promise<void>;
    startupContainer(terminal: Terminal, def: ContainerDef, upTo: ContainerStatus): Promise<void>;
    shutdownContainers(terminal: Terminal, defs: ContainerDef[], downTo: ContainerStatus): Promise<void>;
    startupContainers(terminal: Terminal, defs: ContainerDef[], upTo: ContainerStatus): Promise<void>;
    ensureRunning(terminal: Terminal, def: ContainerDef): Promise<Container>;
    static hasName(container: ContainerInfo, name: string): boolean;
    static imageTitle(info: ImageInfo): string;
    static containerTitle(info: ContainerInfo): string;
    static imageNameMatched(imageName: string, match: string): boolean;
    static imageNames(info: ImageInfo): string[];
    static imageHasMatchedName(info: ImageInfo, match: string): boolean;
    static isRunning(info: ContainerInfo | null): boolean;
    static containersImageMatched(info: ContainerInfo, match: string): boolean;
}
export { DevDocker, };
//# sourceMappingURL=docker.d.ts.map