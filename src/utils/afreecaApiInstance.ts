import axios from 'axios';
import { USER_AGENT, createApiInstance } from './apiInstance';
import { catchRedis, REDIS_KEY } from './redis';

const afreecaAPI = createApiInstance({
    baseURL: 'https://api-channel.sooplive.com/v1.1/',
    headers: { 'user-agent': USER_AGENT },
});

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
                    headers: { 'User-Agent': USER_AGENT },
                })
                .then(({ data }) => data),
        60 // 1분
    );

    return data?.data;
};
