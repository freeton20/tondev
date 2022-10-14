import { Terminal } from "../../core"
import { ContainerDef, DevDocker } from "../../core/docker"
export declare const PORT_NONE = -1
export declare class RegistryError extends Error {}
export declare enum SESourceType {
    TONOS_SE_VERSION = "tonos-se-version",
    DOCKER_IMAGE = "docker-image",
    DOCKER_CONTAINER = "docker-container",
}
export declare type SESource =
    | {
          type: SESourceType.TONOS_SE_VERSION
          version: string
      }
    | {
          type: SESourceType.DOCKER_IMAGE
          image: string
      }
    | {
          type: SESourceType.DOCKER_CONTAINER
          container: string
          image: string
      }
export declare function seSourceVersion(version: string): SESource
export declare function seSourceDockerImage(image: string): SESource
export declare function seSourceDockerContainer(
    container: string,
    image: string,
): SESource
/**
 * SE instance config
 */
export declare type SERegistryItem = {
    /**
     * Instance name
     */
    name: string
    /**
     * SE Instance Source
     */
    source: SESource
    /**
     * Port on localhost used to expose GraphQL API
     * GraphQL API is accessible through http://localhost:port/graphql
     * Node Requests API is accessible through http://localhost:port/topics/requests
     * Default value: 80
     */
    port: number
    /**
     * Port on localhost used to expose ArangoDB API
     */
    dbPort?: number
    /**
     * Optional port on localhost used to expose Node API
     */
    nodePort?: number
}
declare type SERegistryItemInfo = {
    state: string
    docker: {
        image: string
        container: string
    }
}
export declare function updateInstance(
    instance: SERegistryItem,
    updates: Partial<SERegistryItem>,
): void
export declare class SERegistry {
    items: SERegistryItem[]
    private docker
    constructor()
    private getDocker
    save(): void
    static getVersions(): Promise<string[]>
    static getLatestVersion(): Promise<string>
    filter(filter: string, autoCreate: boolean): SERegistryItem[]
    resolveItemSourceVersion(item: SERegistryItem): Promise<string>
    itemContainerDef(item: SERegistryItem): Promise<ContainerDef>
    getSourceInfo(item: SERegistryItem): Promise<string>
    getItemInfo(item: SERegistryItem): Promise<SERegistryItemInfo>
    updateConfig(
        terminal: Terminal,
        filter: string,
        updateInstance: (instance: SERegistryItem) => Promise<void>,
        autoCreate: boolean,
    ): Promise<void>
    controlItems(
        instanceFilter: string,
        control: (docker: DevDocker, defs: ContainerDef[]) => Promise<void>,
    ): Promise<void>
    start(terminal: Terminal, instance: string): Promise<void>
    stop(terminal: Terminal, instance: string): Promise<void>
    reset(terminal: Terminal, instance: string): Promise<void>
    update(terminal: Terminal, instance: string): Promise<void>
    configure(
        terminal: Terminal,
        args: {
            version: string
            image: string
            container: string
            port: string
            dbPort: string
            instance: string
        },
    ): Promise<void>
    delete(instance: string, force: boolean): void
}
export {}
