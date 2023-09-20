'use strict';
import { error as errorLog } from './logger';
import axios from 'axios';
import sleep from 'utils/sleep';

const toss = axios.create({
    baseURL: 'https://api.tosspayments.com/v1/', // discordTk
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(process.env.TOSS_SECRET + ':')}`,
    },
});

// toss.interceptors.request.use(
//     config => {
//         console.log('================= AXIOS REQUEST ==================');
//         console.log(config);
//         console.log('==================================================');
//         return config;
//     },
//     error => {
//         console.error(error.response.data);
//         return Promise.reject(error);
//     }
// );

// toss.interceptors.response.use(
//     config => {
//         console.log('================= AXIOS RESPONSE ==================');
//         console.log(config);
//         console.log('==================================================');
//         return config.data;
//     },
//     error => {
//         console.error(error.response.data);
//         return Promise.reject(error);
//     }
// );

export default toss;
