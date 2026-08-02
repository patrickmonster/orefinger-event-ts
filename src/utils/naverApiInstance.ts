'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { USER_AGENT, createApiInstance } from './apiInstance';
import { REDIS_KEY, catchRedis } from './redis';

const API_VERSION = 'v1';
const baseURL = `https://openapi.naver.com/${API_VERSION}`;

export const naverAPI = createApiInstance({ baseURL }, { logResponse: 'NAVER API' });

const apis: { [version: string]: CustomInstance } = {};

export const getChzzkAPI = (version: string, target?: 'service' | 'polling') => {
    if (!apis[version]) {
        apis[version] = createApiInstance({
            baseURL: `https://api.chzzk.naver.com/${target || 'service'}/${version}/`,
        });
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
                    `https://apis.naver.com/nng_main/nng_comment_api/v1/type/CHANNEL_COMMENT/id/${id}/comments?limit=30&offset=0&orderType=DESC&pagingType=PAGE`,
                    {
                        headers: { 'User-Agent': USER_AGENT },
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
