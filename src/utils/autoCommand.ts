import fs from 'fs';
import { join, parse } from 'path';

interface BaseModule {
    name: string;
    file: string;
    regEx?: RegExp;
    path: string[];
}

// 폴더 모듈
interface ModuleDir extends BaseModule {
    modules: Modules[];
}

// 파일 모듈
interface Module extends BaseModule {
    ext: string;
}

export interface AutoCommandOptions {
    pathTag?: string; // 모듈 경로를 표시할 태그
    isSubfolder?: boolean; // 하위 폴더를 스캔할지 여부
    isLog?: boolean; // 로그 출력 여부
}

export type Modules = ModuleDir | Module;

const util = {
    getOriginFileName: (path: string) => {
        const { dir, name } = parse(path);
        return join(dir, name);
    },

    FileLoader: (modulePath: string, options?: AutoCommandOptions): Module => {
        const { name, ext } = parse(modulePath);
        options?.isLog && console.log('AutoCommand] FileLoader', name, ext);

        return {
            name,
            ext,
            file: modulePath,
            path: [name],
            // module: require(modulePath) as E,
        };
    },

    scanDir: (modulePath: string, options?: AutoCommandOptions, basePath?: string[]): Modules[] => {
        if (!basePath) basePath = []; // 경로 저장
        const files = fs.readdirSync(modulePath);
        options?.isLog && console.log('AutoCommand] ScanDir', files);

        const out: Modules[] = [];
        for (const file of files) {
            const filePath = join(modulePath, file);
            const stat = fs.statSync(filePath); // await promises.stat(filePath);
            try {
                if (stat.isDirectory()) {
                    if (options?.isSubfolder) {
                        const path = [...basePath, file];
                        out.push({
                            name: file,
                            file: filePath,
                            path,
                            modules: util.scanDir(filePath, options, path),
                        });
                    }
                } else {
                    out.push(util.FileLoader(filePath, options)); // Module[]
                }
            } catch (err) {
                console.error(err);
                console.log('AutoCommand] Fail', file);
            }
        }

        return out;
    },

    flattenModules: (list: Modules[]): Module[] =>
        list.reduce<Module[]>((acc, cur) => {
            if ('ext' in cur) acc.push(cur);
            else acc.push(...util.flattenModules(cur.modules).map(module => ({ ...module, path: [cur.name, ...module.path], ext: '.dir' })));
            return acc;
        }, []),
};

/**
 * 자동 명령어 생성
 *
 * 디렉토리 스캔
 * 트리 직열화
 *
 *
 * @generator 각 파일의 module.exports 를 실행
 * @param modulePath
 * @param options
 * @returns
 */
export default (modulePath: string, options?: AutoCommandOptions): [{ name: string; file: string; path: string[]; pathTag: string }[], Modules[]] => {
    const option = Object.assign({ isSubfolder: true, pathTag: ' ' }, options);

    const list = util.scanDir(util.getOriginFileName(modulePath), option); // 디렉토리 스캔
    const modules = util.flattenModules(list).map(i => ({
        name: i.path.join(option.pathTag),
        pathTag: option.pathTag,
        path: i.path,
        file: i.file,
    })); // 트리 직열화

    console.log(
        'AutoCommand] Loading commands',
        modules.map(i => i.name),
        list
    );

    return [modules, list];
};
