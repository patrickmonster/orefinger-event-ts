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

export const createMessage = async (message: string) => {
    return await kakaoAPI.post('/talk/memo/default/send', {
        template_object: {
            object_type: 'feed',
            content: {
                title: '',
                description: message,
                image_url:
                    'https://livecloud-thumb.akamaized.net/chzzk/livecloud/KR/stream/26875492/live/10602244/record/36809290/thumbnail/image_{type}.jpg',
                image_width: 640,
                image_height: 640,
                link: {
                    web_url: 'https://chzzk.naver.com/9381e7d6816e6d915a44a13c0195b202',
                },
            },
            buttons: [
                {
                    title: '바로가기',
                    link: {
                        web_url: 'https://chzzk.naver.com/9381e7d6816e6d915a44a13c0195b202',
                    },
                },
            ],
        },
    });
};
