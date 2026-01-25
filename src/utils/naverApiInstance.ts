'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';
import { REDIS_KEY, catchRedis } from './redis';

const API_VERSION = 'v1';
const baseURL = `https://openapi.naver.com/${API_VERSION}`;
const chzzkURL = `https://comm-api.game.naver.com/nng_main/${API_VERSION}`;

// const naver: CustomInstance = axios.create({
//     baseURL,
//     headers: {
//         authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
//         'client-id': 'q6batx0epp608isickayubi39itsckt',
//     },
// });

// export default naver;

export const naverAPI: CustomInstance = axios.create({ baseURL });

naverAPI.interceptors.response.use(
    ({ data }) => {
        console.log('NAVER API', data);
        return data;
    }, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

const apis: { [version: string]: CustomInstance } = {};

export const getChzzkAPI = (version: string, target?: 'service' | 'polling') => {
    if (!apis[version]) {
        apis[version] = axios.create({ baseURL: `https://api.chzzk.naver.com/${target || 'service'}/${version}/` });
        apis[version].interceptors.response.use(
            ({ data, config }) => {
                // console.log(`CHZZK API(${version}) ::`, data, config);
                return data;
            }, // 데이터 변환
            async error => {
                errorLog('AXIOS', error);
                throw error;
            }
        );
    }
    return apis[version];
};

export interface ChzzkPostComment {
    commentId: number;
    commentType: string;
    replyCount: number;
    parentCommentId: number;
    content: string;
    mentionedUserIdHash: string;
    mentionedUserNickname: string;
    secret: boolean;
    hideByCleanBot: boolean;
    deleted: boolean;
    createdDate: string;
    attaches: any;
    objectType: string;
    objectId: string;
    loungeId: string;
    onlyOneEmoji: boolean;
    childObjectCount: number;
}

export interface ChzzkPostUser {
    userIdHash: string;
    userNickname: string;
    profileImageUrl: string;
    userLevel: number;
    writer: boolean;
    badge: any;
    title: any;
    userRoleCode: string;
    secretOpen: boolean;
    buffnerf: any;
    privateUserBlock: boolean;
    verifiedMark: boolean;
}

export const getChzzkPostComment = async (id: string | number) => {
    const data = await catchRedis(
        REDIS_KEY.API.CHZZK_POST(`${id}`),
        async () =>
            await axios
                .get<
                    ChzzkInterface<{
                        comments: {
                            commentCount: number;
                            totalCount: number;
                            data: {
                                // 필요한 것만
                                comment: ChzzkPostComment;
                                user: ChzzkPostUser;
                            }[];
                            page: {};
                        };
                    }>
                >(
                    `http://${process.env.PROXY}:3000/ncomment/${id}/comments?limit=30&offset=0&orderType=DESC&pagingType=PAGE`,
                    {
                        headers: {
                            'User-Agent':
                                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        },
                    }
                )
                .then(({ data }) => data),
        60 // 1분
    );

    return data?.content?.comments;
};

export interface ChzzkInterface<T extends object> {
    code: number;
    message: string;
    content: T;
}
