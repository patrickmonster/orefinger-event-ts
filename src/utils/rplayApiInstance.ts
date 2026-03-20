'use strict';
import axios from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';
import { REDIS_KEY, catchRedis } from './redis';

const API_VERSION = 'v1';
const baseURL = `https://api.rplay.live`;

// const naver: CustomInstance = axios.create({
//     baseURL,
//     headers: {
//         authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
//         'client-id': 'q6batx0epp608isickayubi39itsckt',
//     },
// });

// export default naver;

export const rplayAPI: CustomInstance = axios.create({ baseURL });

rplayAPI.interceptors.response.use(
    ({ data }) => {
        console.log('RPLAY API', data);
        return data;
    }, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

const apis: { [version: string]: CustomInstance } = {};

export const getRplayAPI = (version: string, target?: 'service' | 'polling') => {
    if (!apis[version]) {
        apis[version] = axios.create({
            baseURL: `https://api.rplay.live/content/main-search?adult=false&contentTypes[]=file&contentTypes[]=video&contentTypes[]=storyChat&contentTypes[]=game&keyword=${encodeURIComponent('양아지')}&ct[]=roleplay&ct[]=${encodeURIComponent('알플챗')}&lang=ko&requestorOid=69a548294412d2adb549de66&platformType=rplay&loginType=plax`,
        });
        apis[version].interceptors.response.use(
            ({ data, config }) => {
                // console.log(`RPLAY API(${version}) ::`, data, config);
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

export const getRplayPostComment = async (id: string | number) => {
    const data = await catchRedis(
        REDIS_KEY.API.RPLAY_POST(`${id}`),
        async () =>
            await axios
                .get<{
                    comments: {
                        /*
cocomments : []
commentReceiver : "69a548294412d2adb549de66"
commenterNickname : "방송알리미"
commenterOid : "69a548294412d2adb549de66"
donationAmount : 0
likes : 0
oid : "69bb571f905a8b1e901bcb92"
rewardClaimed : false
text : "1"
visible : true
_id : "69bb571f55acd58d3add9ee6"
                         */
                        cocomments: any[]; // ?
                        commentReceiver: string; // 수신자
                        commenterNickname: string; // 작성자 닉네임
                        commenterOid: string; // 작성자
                        donationAmount: number;
                        likes: number;
                        oid: string;
                        rewardClaimed: boolean;
                        text: string;
                        visible: boolean;
                        _id: string;
                    }[];
                }>(`https://api.rplay.live/content/community/comments?postOid=${id}&lang=ko&platformType=rplay`, {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    },
                })
                .then(({ data }) => data),
        60 // 1분
    );

    return data?.comments;
};

export interface ChzzkInterface<T extends object> {
    code: number;
    message: string;
    content: T;
}
