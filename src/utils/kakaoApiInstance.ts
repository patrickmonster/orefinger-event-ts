'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';

const API_VERSION = 'v2';
const baseURL = `https://kapi.kakao.com/${API_VERSION}`;

const kakao: CustomInstance = axios.create({
    baseURL,
    headers: {
        authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        'client-id': 'q6batx0epp608isickayubi39itsckt',
    },
});

export default kakao;

export const kakaoAPI: CustomInstance = axios.create({ baseURL });

kakaoAPI.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async (error: any) => {
        console.error('Twitch API Error', error.response?.data || error.message);
        throw error;
    }
);
