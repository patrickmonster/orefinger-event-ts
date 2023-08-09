'use strict';
import { error as errorLog } from './errorLog';
import axios from 'axios';
import sleep from 'utils/sleep';

const discord = axios.create({
    baseURL: 'https://discordapp.com/api/', // discordTk
    headers: { authorization: `Bot ${process.env.DISCORD_TOKEN}` },
});

const discordOpenApi = axios.create({
    baseURL: 'https://discordapp.com/api/', // discordTk
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
export const openApi = discordOpenApi;
