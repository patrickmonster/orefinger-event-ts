import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';
import { catchRedis, REDIS_KEY } from './redis';

interface CommentBadge {
    id: string;
    na: string;
    de: string;
    ig: string;
}

interface Channel {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
    isLive: boolean;
    level: number;
    achievements: any[];
}

interface User {
    id: string;
    channel: Channel;
    c: string;
    bg: CommentBadge[];
}

interface Comment {
    id: string;
    state: string;
    content: string;
    parentId: null;
    isEdited: boolean;
    isSingleEmoji: boolean;
    isLiked: boolean;
    likeCnt: number;
    createdAt: string;
    updatedAt: string;
    user: User;
    replies: any[];
    attachments: any[];
    mentions: any[];
}

const cimeAPI: CustomInstance = axios.create({
    // baseURL: `http://${process.env.PROXY}:3000/soop/`,
    baseURL: 'https://ci.me/api/',
    headers: {
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
});

cimeAPI.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

export default cimeAPI;

// https://bjapi.afreecatv.com/api/orefinger/title/132495419/comment?
export const getCimePostComment = async (id: string | number) => {
    const data = await catchRedis(
        REDIS_KEY.API.CIME_POST(`${id}`),
        async () =>
            cimeAPI
                .get<{
                    data: {
                        comments: Comment[];
                    };
                }>(`/app/comments?targetType=COMMUNITY&targetId=${id}&sort=RECENT&limit=50`, {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    },
                })
                .then(({ data }) => data),
        60 // 1분
    );

    return data.comments;
};
