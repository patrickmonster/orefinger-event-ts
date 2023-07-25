import fs, { promises } from 'fs';
import path, { join, parse } from 'path';

export type Module = { name: string; ext: string; path?: string; module: any };
export type ModuleDir = {
    name: string;
    path?: string;
    modules: Modules[];
};

export type Modules = ModuleDir | Module;

export interface AutoCommandOptions {
    pathTag?: string; // 모듈 경로를 표시할 태그
}

const FileLoader = (modulePath: string): Module => {
    const { name, ext } = parse(modulePath);
    console.log('AutoCommand] FileLoader', name, ext);

    return {
        name,
        ext,
        module: require(modulePath).default,
    };
};
/**
 * 폴더 스캔하여 파일 로드
 * @param modulePath
 */
const ScanDir = async (modulePath: string, basePath: string[], options?: AutoCommandOptions): Promise<ModuleDir> => {
    const files = await promises.readdir(modulePath);
    console.log('AutoCommand] ScanDir', files);
    const modules = new Array<Modules>();
    for (const file of files) {
        const filePath = path.join(modulePath, file);
        const stat = await promises.stat(filePath);
        try {
            if (stat.isDirectory()) {
                modules.push(await ScanDir(filePath, [...basePath, file], options));
            } else modules.push(FileLoader(filePath)); // Module[]
            // Module | ModuleDir
        } catch (err) {
            console.error(err);
            console.log('AutoCommand] Fail', file);
        }
    }
    return {
        name: path.basename(modulePath),
        path: basePath.join(options?.pathTag || '/'),
        modules,
    };
};

const getOriginFileName = (path: string) => {
    const { dir, name } = parse(path);
    return join(dir, name);
};
export default async (modulePath: string, options?: AutoCommandOptions) =>
    flattenModules((await ScanDir(getOriginFileName(modulePath), [], options)).modules);

export const flattenModules = (modules: Modules[], path?: string): Module[] => {
    const flatModules: Module[] = [];
    for (const module of modules) {
        if ('module' in module) {
            // Module
            flatModules.push({
                ...module,
                path,
            });
        } else {
            // ModuleDir
            flatModules.push(...flattenModules(module.modules, module.path));
        }
    }
    return flatModules;
};
