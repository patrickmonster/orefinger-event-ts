import { USER_AGENT, createApiInstance } from './apiInstance';
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

const cimeAPI = createApiInstance({
    baseURL: 'https://ci.me/api/',
    headers: { 'user-agent': USER_AGENT },
});

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
                    headers: { 'User-Agent': USER_AGENT },
                })
                .then(({ data }) => data),
        60 // 1분
    );

    return data.comments;
};
