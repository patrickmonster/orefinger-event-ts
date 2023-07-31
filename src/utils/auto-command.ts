import fs, { promises } from 'fs';
import path, { join, parse } from 'path';

export type Module = {
    name: string;
    ext: string;
    path?: string;
    module: {
        exec: Function;
        alias?: string[];
    };
};
export type ModuleDir = {
    name: string;
    path?: string;
    modules: Modules[];
};

export type Modules = ModuleDir | Module;

export interface AutoCommandOptions {
    pathTag?: string; // 모듈 경로를 표시할 태그
    isLog?: boolean; // 로그 출력 여부
    defaultFunction?: Function;
}

const FileLoader = (modulePath: string, options?: AutoCommandOptions): Module => {
    const { name, ext } = parse(modulePath);
    options?.isLog && console.log('AutoCommand] FileLoader', name, ext);

    return {
        name,
        ext,
        module: require(modulePath),
    };
};
/**
 * 폴더 스캔하여 파일 로드
 * @param modulePath
 */
const ScanDir = (modulePath: string, basePath: string[], options?: AutoCommandOptions): ModuleDir => {
    // const files = await promises.readdir(modulePath);
    const files = fs.readdirSync(modulePath);
    options?.isLog && console.log('AutoCommand] ScanDir', files);
    const modules = new Array<Modules>();
    for (const file of files) {
        const filePath = path.join(modulePath, file);
        const stat = fs.statSync(filePath); // await promises.stat(filePath);
        try {
            if (stat.isDirectory()) {
                modules.push(ScanDir(filePath, [...basePath, file], options));
            } else modules.push(FileLoader(filePath, options)); // Module[]
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

// 다차원 배열을 1차원 배열로 변환
const flattenModules = (modules: Modules[], path?: string): Module[] => {
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

export default (modulePath: string, options?: AutoCommandOptions) => {
    const modules = flattenModules(ScanDir(getOriginFileName(modulePath), [], options).modules);
    const commands: { [key: string]: Function } = {};
    for (const command of modules) {
        const { path, name, module } = command;
        const custom_id = `${path ? path + ' ' : ''}${name}`;
        if (module.exec) commands[custom_id] = module.exec;
        else console.error('ERROR] exec is not defined', custom_id);
    }
    return (id: string) => {
        const command = Object.keys(commands).findIndex(i => id.startsWith(i));
        console.log('Event]', id);
        return <T>(interaction: T) =>
            (command ? commands[command] : options?.defaultFunction || (() => {}))(interaction, id.replace(command + ' ', ''));
    };
};
export const findCommand = (id: string, commands: { [k: string]: Function }, defaultFunction = () => {}) => {
    const command = Object.keys(commands).find(i => id.startsWith(i));
    return command ? commands[command] : defaultFunction;
};
