import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandInteractionDataOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import fs from 'fs';
import path, { join, parse } from 'path';

export type Module = {
    name: string;
    ext: string;
    path?: string;
    module: {
        exec: Function;
        default: APIApplicationCommandInteractionDataBasicOption;
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
    isSubfolder?: boolean; // 하위 폴더를 스캔할지 여부
    isLog?: boolean; // 로그 출력 여부
    isOption?: boolean; // 옵션 사용 여부 ( false 일 경우, 옵션을 사용하지 않음)
    defaultFunction?: ((...interaction: any[]) => void) | boolean;
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
                if (options?.isSubfolder) {
                    modules.push(ScanDir(filePath, [...basePath, file], options));
                }
            } else {
                modules.push(FileLoader(filePath, options)); // Module[]
            }
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
const flattenModules = <E extends APIApplicationCommandInteractionDataOption>(
    modules: Modules[],
    path?: string,
    isSubCommand?: boolean
): Module[] => {
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
            if (isSubCommand) continue;
            const modules = flattenModules<APIApplicationCommandInteractionDataBasicOption>(module.modules, module.path);
            for (const module of modules) {
                flatModules.push({
                    name: path || '',
                    ext: '.dir',
                    module: {
                        exec: () => {},
                        default: {
                            name: module.name,
                            type: ApplicationCommandOptionType.Subcommand,
                            options: module.module.default,
                        },
                    },
                    // ...module,
                    // path: path ? path + ' ' + module.path : module.path,
                });
            }
        }
    }

    return flatModules;
};
type ModuleFunction = { [key: string]: Function };

export default (
    modulePath: string,
    options?: AutoCommandOptions
): [APIApplicationCommandInteractionDataOption[], (id: string) => <T, U = any>(interaction: T, args?: U[] | undefined) => any] => {
    const option = Object.assign({ defaultFunction: () => {}, isSubfolder: true }, options);

    const dir = ScanDir(getOriginFileName(modulePath), [], option).modules;
    console.log('SCAN]', dir);

    const modules = flattenModules<APIApplicationCommandInteractionDataOption>(dir);
    // const modulesAPI = modules.map((api) => api);
    const commands = modules.reduce((acc, { name, path, module }) => {
        const custom_id = `${path ? path + ' ' : ''}${name}`;
        if (module.exec) acc[custom_id] = module.exec;
        else console.error('ERROR] exec is not defined', custom_id);
        return acc;
    }, {} as ModuleFunction);

    return [
        modules.map(({ module }) => module.default),
        (id: string) => {
            const command = Object.keys(commands).find(i => id.startsWith(i));

            if (command) console.log('Event]', id);

            return command
                ? <T, U = any>(interaction: T, args?: U[]) => commands[command](interaction, options?.isOption ? args : id.replace(command + ' ', ''))
                : option.defaultFunction;
        },
    ];
};
export const findCommand = (id: string, commands: { [k: string]: Function }, defaultFunction = () => {}) => {
    const command = Object.keys(commands).find(i => id.startsWith(i));
    return command ? commands[command] : defaultFunction;
};
