export = swagRequire;
export as namespace NodeJS;

declare const swagRequire: SwagRequire.SwagRequireStatic;

declare module NodeJS {
    interface Global {
        swagRequire: { instances: { [key: string]: SwagRequire.SwagRequire } }
    }
}

declare namespace SwagRequire {
    interface SwagRequire {
        paths: string[]

        ignore: string[]

        /**
         *
         * @param {SwagRequireConfig} config
         */
        constructor(config: SwagRequireConfig): SwagRequire;

        /**
         *
         * @param {string[]} paths
         */
        setPaths(paths: string[]): void

        /**
         *
         * @param {string} path
         */
        addPath(path: string): void

        /**
         * @throws Error
         * @param {string} file
         * @return {string}
         */
        resolvePath(file: string): string

        /**
         * @throws Error
         * @param {string} path
         * @return {any}
         */
        require(path: string): any

        /**
         * @throws Error
         * @param {string} file
         * @return {any}
         */
        requireMerged(file: string): any

        /**
         *
         * @param {string} file
         * @return {string[]}
         */
        getIgnorePaths(file: string): string[]
    }

    interface SwagRequireConfig {
        paths?: string[]
        ignore?: string[]
    }

    interface SwagRequireStatic {
        /**
         * @throws Error
         * @param {SwagRequireConfig} config
         * @param {string} identifier
         * @return {SwagRequire}
         */
        getInstance(config?: SwagRequireConfig, identifier?: string): SwagRequire;
    }
}

