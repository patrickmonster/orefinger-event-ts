'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { env } from 'process';
import { error as errorLog } from './logger';

const baseURL = `https://sms.gabia.com`;

// const naver: CustomInstance = axios.create({
//     baseURL,
//     headers: {
//         authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
//         'client-id': 'q6batx0epp608isickayubi39itsckt',
//     },
// });

// export default naver;

export const gabiaAPI: CustomInstance = axios.create({ baseURL });
gabiaAPI.interceptors.request.use(
    config => {
        console.log('GABIA API', config);
        return config;
    },
    error => {
        errorLog('AXIOS', error);
        throw error;
    }
);
gabiaAPI.interceptors.response.use(
    ({ data }) => {
        console.log('GABIA API', data);
        return data;
    }, // 데이터 변환
    async error => {
        console.log('GABIA API', error);
        errorLog('AXIOS', error);
        throw error;
    }
);

export type Token = {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
};

export const getToken = async () =>
    gabiaAPI.post<Token>(
        '/oauth/token',
        {
            grant_type: 'client_credentials',
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(env.GABIA_NAME + ':' + env.GABIA_KEY).toString('base64')}`,
                // Authorization: `Basic ${env.GABIA_KEY}`,
            },
        }
    );

/**
 * @description 알림톡을 전송합니다.
 *  즉시발송용 API입니다.
 */
export const sendAlimTalk = async (
    token: Token,
    {
        template_id,
        template_variable,
        phone,
    }: { template_id: string | number; template_variable: string; phone: string }
) =>
    gabiaAPI.post(
        '/api/send/alimtalk',
        {
            template_id,
            template_variable,
            phone,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${token.token_type} ${token.access_token}`,
            },
        }
    );

export const sendSms = async <E>(
    token: Token,
    {
        callback,
        message,
        refkey,
        phone,
    }: {
        callback: string;
        message: string;
        refkey: string;
        phone: string;
    }
) =>
    gabiaAPI.post<E>(
        '/api/send/sms',
        {
            callback,
            message,
            refkey,
            phone,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(env.GABIA_NAME + ':' + token.access_token).toString('base64')}`,
            },
        }
    );
