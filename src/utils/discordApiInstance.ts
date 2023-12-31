'use strict';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RESTPostAPIChannelMessage } from 'plugins/discord';
import sleep from 'utils/sleep';
import imageBase64 from './imageBase64';
import { error as errorLog } from './logger';

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}
const discord: CustomInstance = axios.create({
    baseURL: 'https://discord.com/api/', // discordTk
    headers: { authorization: `Bot ${process.env.DISCORD_TOKEN}` },
});

discord.interceptors.response.use(
    ({ data }) => data,
    async error => {
        if (error.config && error.response && error.response.status === 429) {
            console.log('Too Many Requests! Retrying...');
            const { message, retry_after } = error.response.data;
            await sleep(Math.ceil(retry_after / 1000) + 1);
            return discord(error.config);
        }
        errorLog('AXIOS', error);
        throw error;
    }
);

export default discord;
export const openApi = axios.create({
    baseURL: 'https://discord.com/api/', // discordTk
});

openApi.interceptors.response.use(null, async error => {
    if (error.config && error.response && error.response.status === 429) {
        console.log('Too Many Requests! Retrying...');
        const { message, retry_after } = error.response.data;
        await sleep(Math.ceil(retry_after / 1000) + 1);
        return discord(error.config);
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
    discord.patch(`/guilds/${guild_id}/members/${user_id}`, { nick });
