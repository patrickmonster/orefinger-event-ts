'use strict';
import axios, { AxiosResponse } from 'axios';

const sleep = require('./sleep');

const twitch = axios.create({
    baseURL: 'https://api.twitch.tv/helix', // discordTk
    headers: {
        authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        'client-id': 'q6batx0epp608isickayubi39itsckt',
    },
});

// const discordOpenApi = axios.create({
//     baseURL: 'https://discordapp.com/api/', // discordTk
// });

twitch.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async (error: any) => {
        if (error.config && error.response && error.response.status === 429) {
            console.log('Too Many Requests! Retrying...');
            const { message, retry_after } = error.response.data;
            await sleep(Math.ceil(retry_after / 1000) + 1);
            return twitch(error.config);
        }
        throw error;
    }
);

export default twitch;

export const Get = async <T>(url: string, config?: any): Promise<T> => {
    const { data } = await twitch.get<T>(url, config);
    return data;
};
// module.exports.openApi = discordOpenApi;
