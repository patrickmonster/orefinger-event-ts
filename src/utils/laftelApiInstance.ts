'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { LaftelVod } from 'interfaces/API/Laftel';
import { error as errorLog } from './logger';

const laftelAPI: CustomInstance = axios.create({
    baseURL: 'https://api.laftel.net/api/',
    headers: {
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
});

laftelAPI.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

export default laftelAPI;

export const getLaftelVods = async () => await laftelAPI.get<LaftelVod[]>(`/search/v2/daily/`);
