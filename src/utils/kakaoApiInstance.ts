'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { createApiInstance } from './apiInstance';

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

export const kakaoAPI = createApiInstance({ baseURL });
