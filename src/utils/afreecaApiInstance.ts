import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';
import { catchRedis, REDIS_KEY } from './redis';

const afreecaAPI: CustomInstance = axios.create({
    // baseURL: `http://${process.env.PROXY}:3000/soop/`,
    baseURL: 'https://bjapi.afreecatv.com/api/',
    headers: {
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
});

afreecaAPI.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

export default afreecaAPI;

// https://bjapi.afreecatv.com/api/orefinger/title/132495419/comment?
export const getAfreecaPostComment = async (id: string | number) => {
    const data = await catchRedis(
        REDIS_KEY.API.AFREECA_POST(`${id}`),
        async () =>
            axios
                .get<{
                    data: {
                        p_comment_no: number;
                        is_best_top: boolean;
                        title_no: number;
                        user_nick: string;
                        user_id: string;
                        profile_image: string;
                        comment: string;
                        c_comment_cnt: number;
                        like_cnt: number;
                        ip: string;
                        reg_date: string;
                        reg_date_humans: string;
                        photo: any;
                        bjlike: any;
                        is_like: boolean;
                        is_pinable: boolean;
                        is_pin: boolean;
                        is_highlight: boolean;
                        pin_nick: string;
                        authority: any;
                        badge: any;
                        tag_user_id: string;
                        tag_user_nick: string;
                        tag_index: number;
                        tag_check: boolean;
                    }[];
                }>(`https://chapi.sooplive.co.kr/api/orefinger/title/${id}/comment`, {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    },
                })
                .then(({ data }) => data),
        60 // 1분
    );

    return data?.data;
};
