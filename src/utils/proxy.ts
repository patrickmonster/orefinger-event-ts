import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';

const api: CustomInstance = axios.create({
    headers: {
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
    proxy: {
        host: 'brd.superproxy.io:22225',
        port: 22225,
        auth: {
            username: `${process.env.PROXY_ID}`,
            password: `${process.env.PROXY_PW}`,
        },
    },
});

api.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

export default api;
