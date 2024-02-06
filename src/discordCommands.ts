/**
 * @file discordCommands.ts
 * @description 디스코드 커맨드를 갱신합니다.
 *
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionFlagsBits,
    RESTPutAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import discord from 'utils/discordApiInstance';
import { api } from './interactions/app';

function registerCmd(commands: RESTPutAPIApplicationCommandsJSONBody) {
    discord
        .put(
            `/applications/${env.DISCORD_CLIENT_ID}/${env.TARGET_GUILD ? `guilds/${env.TARGET_GUILD}/` : ''}commands`,
            JSON.parse(JSON.stringify(commands, bigintConvert))
        )
        .then(res => {
            console.log('명령어 등록]', res);
            process.exit(0);
        })
        .catch(err => {
            console.error('명령어 등록 실패]', err.response.data);
            process.exit(1);
        });
}

const bigintConvert = (key: string, value: any) => (typeof value === 'bigint' ? value.toString() : value);

const loadFile = (path: string) => {
    const { default: file, isAdmin, default_member_permissions } = require(path);
    if (env.TARGET_GUILD) {
        // 어드민 길드용
        if (isAdmin) return file;
    } else {
        if (!isAdmin) return file;
    }
};
const commands: RESTPutAPIApplicationCommandsJSONBody = [];

const permissionList: {
    [key: string]: number | bigint;
} = {
    알림: PermissionFlagsBits.Administrator,
};

console.log('권한 : ', permissionList);

// 앱커맨드 (1뎁스)
for (const { file } of api.app) commands.push(loadFile(file));
for (const module of api.chat) {
    console.log('명령어 로드]', module.name);

    if ('modules' in module) {
        // 그룹 파일
        const { modules } = module;
        const options = modules
            .map(module => {
                // load subcommand
                if ('modules' in module) {
                    const { modules } = module;
                    const options = modules
                        .map(module => {
                            if ('modules' in module) throw new Error('서브 커맨드 그룹은 3단계까지만 지원합니다.');
                            return loadFile(module.file);
                        })
                        .filter(v => v);

                    return {
                        name: module.name,
                        description: `${module.name} 명령어`,
                        type: ApplicationCommandOptionType.SubcommandGroup,
                        options,
                    };
                } else return loadFile(module.file);
            })
            .filter(v => v);

        // 서브커맨드 그룹
        if (options.length)
            commands.push({
                name: module.name,
                description: `${module.name} 명령어`, // 왜 필수?
                type: ApplicationCommandType.ChatInput,
                default_member_permissions: `${permissionList[module.name] || 0}`,
                // default_member_permissions: module?.default_member_permissions || 0,
                options,
            });
    } else {
        // 단일파일
        commands.push(loadFile(module.file));
    }
}
console.log('명령어 로드 완료]', JSON.stringify(commands));

registerCmd(commands.filter(v => v));

// process.exit(0);

// discord.get(`/applications/${env.DISCORD_CLIENT_ID}/commands`).then(res => {
//     console.log('명령어 조회]', res);
// });
