'use strict';
import { REST } from '@discordjs/rest';
import axios from 'axios';
import { RESTPostAPIChannelMessage } from 'plugins/discord';
import sleep from 'utils/sleep';
import imageBase64 from './imageBase64';
import { error as errorLog } from './logger';

const rest = new REST({ version: '10' }).setToken(`${process.env.DISCORD_TOKEN}`);

rest.on('rateLimited', rateLimitInfo => {
    console.log(`Rate limited for ${rateLimitInfo.sublimitTimeout}ms`);
});

rest.on('invalidRequestWarning', invalidRequestInfo => {
    console.log(`Invalid request warning: ${invalidRequestInfo.count} ${invalidRequestInfo.remainingTime}`);
});

export default rest;
export const openApi = axios.create({
    baseURL: 'https://discord.com/api/', // discordTk
});

openApi.interceptors.response.use(null, async error => {
    if (error.config && error.response && error.response.status === 429) {
        console.log('Too Many Requests! Retrying...', error.config.url);
        const { message, retry_after } = error.response.data;
        await sleep(Math.ceil(retry_after / 1000) + 1);
        return openApi(error.config);
    }
    errorLog('AXIOS', error);
    throw error;
});

export type AttachFile = {
    name: string;
    file: Blob | string;
};

export const createAttach = async (message: RESTPostAPIChannelMessage, ...filesUrl: AttachFile[]) => {
    const form = new FormData();
    const blob = new Blob([JSON.stringify(message)], { type: 'application/json' });
    form.append('payload_json', blob);
    for (const i in filesUrl) {
        const { name, file } = filesUrl[i];
        form.append(`files[${i}]`, typeof file === 'string' ? await imageBase64(file) : file, name);
    }
    return form;
};

export const getToken = async (refresh_token: string) =>
    openApi.post(
        'oauth2/token',
        {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

export const changeNickname = async (guild_id: string, user_id: string, nick: string) =>
    rest.patch(`/guilds/${guild_id}/members/${user_id}`, {
        body: { nick },
    });
