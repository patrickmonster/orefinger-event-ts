'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';

const baseURL = `http://${process.env.PROXY}:3000/mobingi/`;

// const naver: CustomInstance = axios.create({
//     baseURL,
//     headers: {
//         authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
//         'client-id': 'q6batx0epp608isickayubi39itsckt',
//     },
// });

// export default naver;

export const mobinogiAPI: CustomInstance = axios.create({ baseURL });

mobinogiAPI.interceptors.response.use(
    ({ data }) => {
        console.log('MOBINOGI API', data);
        return data;
    }, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);
