'use strict';
import { FastifyInstance } from 'fastify';

import axios from 'axios';
import {
    auth,
    authTypes,
    deleteAuthConnection,
    deleteAuthConnectionAuthTypes,
    discord,
    selectDiscordUserByJWTToken,
    upsertDiscordUserAndJWTToken,
    userIds,
} from 'controllers/auth';
import discordApi, { openApi } from 'utils/discordApiInstance';
import { kakaoAPI } from 'utils/kakaoApiInstance';
import { naverAPI } from 'utils/naverApiInstance';
import toss from 'utils/tossApiInstance';
import twitch, { twitchAPI } from 'utils/twitchApiInstance';

import { APIUser } from 'discord-api-types/v10';
import qs from 'querystring';

export default async (fastify: FastifyInstance, opts: any) => {
    const getToken = async (target: string, data: string) =>
        axios
            .post<{
                access_token: string;
                refresh_token: string;
                expires_in: number;
                token_type: string;
            }>(target, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(res => res.data);

    fastify.addSchema({
        $id: 'userId',
        type: 'string',
        description: '사용자 아이디',
        enum: ['466950273928134666', '338368635103870977', '206100523621941248'],
    });

    fastify.addSchema({
        $id: 'discordUser',
        type: 'object',
        properties: {
            id: { type: 'string', description: '디스코드 사용자 아이디' },
            username: { type: 'string', description: '디스코드 사용자 이름' },
            avatar: { type: 'string', description: '디스코드 사용자 아바타' },
            discriminator: { type: 'string', description: '디스코드 사용자 태그' },
            public_flags: { type: 'number', description: '디스코드 사용자 플래그' },
            flags: { type: 'number', description: '디스코드 사용자 플래그' },
            locale: { type: 'string', description: '디스코드 사용자 언어' },
            banner: { type: 'string', description: '디스코드 사용자 배너' },
            banner_color: { type: 'string', description: '디스코드 사용자 배너 색상' },
            accent_color: { type: 'number', description: '디스코드 사용자 색상' },
            email: { type: 'string', description: '디스코드 사용자 이메일' },
            verified: { type: 'boolean', description: '디스코드 사용자 이메일 인증 여부' },
            avatar_decoration: { type: 'string', description: '디스코드 사용자 아바타 장식' },
            mfa_enabled: { type: 'boolean', description: '디스코드 사용자 2단계 인증 여부' },
            premium_type: { type: 'number', description: '디스코드 사용자 프리미엄 타입' },
            system: { type: 'boolean', description: '디스코드 사용자 시스템 여부' },
        },
    });

    // 인증 모듈 (백도어)
    if (!process.env.MASTER_KEY) {
        fastify.get<{
            Params: { user_id: string };
        }>(
            '/auth/:user_id',
            {
                schema: {
                    description: '디스코드 사용자 인증 - 로컬 테스트용',
                    tags: ['Auth'],
                    deprecated: false, // 비활성화
                    params: {
                        type: 'object',
                        required: ['user_id'],
                        additionalProperties: false,
                        properties: { user_id: { $ref: 'userId' } },
                    },
                },
            },
            async req => fastify.jwt.sign({ access_token: '?', id: req.params.user_id })
        );

        fastify.get<{
            Params: { user_id: string };
        }>(
            '/auth/:user_id/jwt',
            {
                schema: {
                    description: '디스코드 사용자 인증 - 로컬 테스트용 / 페이지 인증용 토큰',
                    tags: ['Auth'],
                    deprecated: false, // 비활성화
                    params: {
                        type: 'object',
                        required: ['user_id'],
                        additionalProperties: false,
                        properties: { user_id: { $ref: 'userId' } },
                    },
                },
            },
            async req => {
                const user = await discordApi.get<APIUser>(`/users/${req.params.user_id}`);
                return await upsertDiscordUserAndJWTToken(user);
            }
        );
    }

    fastify.get(
        '/auth',
        {
            schema: {
                description: '디스코드 사용자 인증 - 필수 데이터',
                tags: ['Auth'],
                deprecated: false, // 비활성화
            },
        },
        async () => {
            const scopes = [
                'identify',
                'email',
                'connections',
                'guilds',
                'role_connections.write',
                'guilds.members.read',
            ];
            const types = await authTypes();
            return { client_id: process.env.DISCORD_CLIENT_ID, scopes, types, permissions: 1249768893497 };
        }
    );

    fastify.get(
        '/auth/infos',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '사용자 인증정보 수신',
                tags: ['Auth'],
                deprecated: false, // 비활성화
            },
        },
        async req => {
            const { id } = req.user;
            return await userIds(id);
        }
    );

    fastify.delete<{
        Params: { type: deleteAuthConnectionAuthTypes; target: string };
    }>(
        '/auth/:type/:target',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '사용자의 연결된 계정을 삭제합니다.',
                tags: ['Auth'],
                deprecated: false, // 비활성화
                params: {
                    type: 'object',
                    required: ['type', 'target'],
                    additionalProperties: false,
                    properties: {
                        type: {
                            type: 'string',
                            description: '인증 타입',
                            enum: [
                                'discord',
                                'twitch.stream',
                                'twitch',
                                'tiktok',
                                'afreecatv',
                                'kakao',
                                'youtube',
                                'toss',
                                'toss.test',
                            ],
                        },
                        target: { type: 'string', description: '인증 대상' },
                    },
                },
            },
        },
        async req => {
            const { id } = req.user;
            const { target, type } = req.params;
            return await deleteAuthConnection(type, id, target);
        }
    );

    // 인증 모듈
    fastify.post<{
        Body: {
            code: string;
            redirect_uri: string;
        };
    }>(
        '/auth',
        {
            schema: {
                description: '디스코드 사용자 인증',
                tags: ['Auth'],
                deprecated: false, // 비활성화
                body: {
                    type: 'object',
                    required: ['code' /* 'customerKey',*/],
                    additionalProperties: false,
                    properties: {
                        code: { type: 'string', description: 'oauth 인증 code 값' },
                        redirect_uri: { type: 'string', description: '인증시 사용되었던 url' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            user: { $ref: 'discordUser' },
                            jwt: { type: 'string', description: 'jwt 토큰' },
                        },
                    },
                    400: { type: 'object', properties: { message: { type: 'string', description: '에러 메세지' } } },
                    500: { type: 'object', properties: { message: { type: 'string', description: '에러 메세지' } } },
                },
            },
        },
        async req => {
            const { code, redirect_uri } = req.body;

            return await getToken(
                'https://discord.com/api/oauth2/token',
                qs.stringify({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri,
                })
            )
                .then(async ({ access_token, refresh_token, expires_in, token_type }) => {
                    const { data: user } = await openApi.get('/users/@me', {
                        headers: { Authorization: `${token_type} ${access_token}` },
                    });
                    await discord(user, refresh_token);

                    try {
                        const { data: connections } = await openApi.get<
                            {
                                id: string; // 고유 아이디
                                name: string; // 이름
                                type: string; // 타입
                                friend_sync: boolean; // 친구 동기화 여부 ?
                                metadata_visibility: number; // 메타데이터 가시성
                                show_activity: boolean; // 활동 표시 여부
                                two_way_link: boolean; // 양방향 링크 여부
                                verified: boolean; // 인증 여부
                                visibility: number; // 가시성
                            }[]
                        >('/users/@me/connections', {
                            headers: { Authorization: `${token_type} ${access_token}` },
                        });
                        const list = connections.filter(({ type }) => type === 'twitch').map(({ id }) => id);
                        if (list.length > 0) {
                            const { data } = await twitch.get<{
                                data: {
                                    id: string;
                                    login: string;
                                    display_name: string;
                                    type: string;
                                    broadcaster_type: string;
                                    description: string;
                                    profile_image_url: string;
                                    offline_image_url: string;
                                    view_count: number;
                                    email: string;
                                    created_at: string;
                                }[];
                            }>(`/users?${list.map(id => `id=${id}`).join('&')}`);
                            for (const twitch_user of data) {
                                await auth(
                                    'twitch',
                                    user.id,
                                    {
                                        id: twitch_user.id,
                                        username: twitch_user.login,
                                        discriminator: twitch_user.display_name,
                                        email: twitch_user.email,
                                        avatar: twitch_user.profile_image_url,
                                    },
                                    'CONNECTED_USER',
                                    twitch_user.type
                                );
                            }
                        }
                    } catch (e) {
                        // 권한없음
                        console.error(e);
                    }

                    // discord.
                    const jwt = fastify.jwt.sign({ access_token, id: user.id }, { expiresIn: expires_in });
                    return { user, jwt };
                })
                .catch(e => {
                    console.error(e);
                    throw { message: e.message };
                });
        }
    );

    fastify.post<{
        Body: { code: string };
    }>(
        '/auth/jwt',
        {
            schema: {
                description: '디스코드에서 바로 연결된 사용자',
                tags: ['Auth'],
                deprecated: false, // 비활성화
                body: {
                    type: 'object',
                    required: ['code'],
                    additionalProperties: false,
                    properties: {
                        code: { type: 'string', description: 'jwt 인증 code 값' },
                    },
                },
            },
        },
        async req => {
            const { code } = req.body;
            const userTokenData = await selectDiscordUserByJWTToken(code);

            if (!userTokenData) {
                return { message: '사용자 정보가 없습니다.' };
            } else {
                const { auth_id } = userTokenData;

                const user = await discordApi.get(`/users/${auth_id}`);
                const jwt = fastify.jwt.sign({ access_token: '?', id: auth_id }, { expiresIn: 60 * 60 * 24 });
                return { user, jwt };
            }
        }
    );

    // 인증 모듈 - 토스
    fastify.patch<{
        Body: {
            cardNumber: string;
            cardExpirationYear: string;
            cardExpirationMonth: string;
            cardPassword: string;
            customerIdentityNumber: string;
            cardName: string;
        };
    }>(
        '/auth/toss',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '계정 연결 - 디스코드 계정을 기반으로 토스 페이먼츠 카드 정보를 등록 합니다.',
                tags: ['Auth'],
                deprecated: false, // 비활성화
                body: {
                    type: 'object',
                    required: [
                        'cardNumber',
                        'cardExpirationYear',
                        'cardExpirationMonth',
                        'cardPassword',
                        'customerIdentityNumber',
                        'cardName',
                    ],
                    additionalProperties: false,
                    properties: {
                        cardNumber: { type: 'string', description: '카드번호' },
                        cardExpirationYear: { type: 'string', description: '카드 유효기간 연도' },
                        cardExpirationMonth: { type: 'string', description: '카드 유효기간 월' },
                        cardPassword: { type: 'string', description: '카드 비밀번호 앞 2자리' },
                        customerIdentityNumber: { type: 'string', description: '주민등록번호 또는 사업자등록번호' },
                        cardName: { type: 'string', description: '카드 별칭' },
                        // customerKey: { type: 'string', description: '가맹점 고유 키' },
                    },
                },
            },
        },
        async req => {
            const { id } = req.user;
            const {
                cardNumber,
                cardExpirationYear,
                cardExpirationMonth,
                cardPassword,
                customerIdentityNumber,
                cardName,
            } = req.body;

            try {
                const { data: user } = await toss.post<{
                    mId: string;
                    customerKey: string;
                    authenticatedAt: string;
                    method: string;
                    billingKey: string;
                    cardCompany: string;
                    cardNumber: string;
                    card: {
                        issuerCode: string;
                        acquirerCode: string;
                        number: string;
                        cardType: string;
                        ownerType: string;
                    };
                }>('/billing/authorizations/card', {
                    cardNumber,
                    cardExpirationYear,
                    cardExpirationMonth,
                    cardPassword,
                    customerIdentityNumber,
                    customerKey: id,
                });

                console.log(user);
                await auth(
                    'toss.test',
                    id,
                    {
                        id,
                        username: cardName,
                        discriminator: user.cardNumber,
                        email: cardNumber,
                        avatar: user.mId,
                    },
                    user.billingKey
                );
                return { message: 'success' };
            } catch (e) {
                console.error(e);
                return { message: '인증에 실패함' };
            }
        }
    );

    // 인증 모듈
    fastify.post<{
        Params: { target: string };
        Body: {
            code: string;
            redirect_uri: string;
        };
    }>(
        '/auth/:target',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '계정 연결 - 디스코드 계정을 기반으로 사용자를 추가로 등록 합니다.',
                tags: ['Auth'],
                deprecated: false, // 비활성화
                params: {
                    type: 'object',
                    required: ['target'],
                    additionalProperties: false,
                    properties: {
                        target: {
                            type: 'string',
                            description: '인증 대상',
                            enum: ['twitch', 'kakao', 'naver'],
                        },
                    },
                },
                body: {
                    type: 'object',
                    required: ['code' /* 'customerKey',*/],
                    additionalProperties: false,
                    properties: {
                        code: { type: 'string', description: 'oauth 인증 code 값' },
                        redirect_uri: { type: 'string', description: '인증시 사용되었던 url' },
                    },
                },
                response: {
                    200: { type: 'object', properties: { token: { type: 'string', description: 'access token' } } },
                    400: { type: 'object', properties: { message: { type: 'string', description: '에러 메세지' } } },
                },
            },
        },
        async req => {
            const { target } = req.params;
            const { id } = req.user;
            const { code, redirect_uri } = req.body;
            const types = (await authTypes(true)).find(({ tag }) => tag === target);
            if (types === undefined) {
                return { message: '잘못된 인증 대상입니다.' };
            }

            const client_id = `${types.client_id}`;
            const client_secret = `${types.client_sc}`;

            const params = qs.stringify({
                client_id,
                client_secret,
                grant_type: 'authorization_code',
                code,
                redirect_uri,
            });

            console.log('로그인 인증 요청', params);

            let token;
            switch (target) {
                case 'twitch':
                case 'twitch.stream':
                    token = await getToken(`https://id.twitch.tv/oauth2/token`, params).then(async token => {
                        const {
                            data: {
                                data: [user],
                            },
                        } = await twitchAPI.get<{
                            data: {
                                id: string;
                                login: string;
                                display_name: string;
                                type: string;
                                broadcaster_type: string;
                                description: string;
                                profile_image_url: string;
                                offline_image_url: string;
                                view_count: number;
                                email: string;
                                created_at: string;
                            }[];
                        }>('/users', {
                            headers: { Authorization: `Bearer ${token.access_token}`, 'Client-Id': client_id },
                        });

                        await auth(
                            target,
                            id,
                            {
                                id: user.id,
                                username: user.login,
                                discriminator: user.display_name,
                                email: user.email,
                                avatar: user.profile_image_url,
                            },
                            token.refresh_token,
                            user.type
                        );

                        return { message: 'success', id: user.id };
                    });
                    break;
                case 'kakao':
                    token = getToken(`https://kauth.kakao.com/oauth/token`, params).then(async token => {
                        const {
                            id: kakaoId,
                            connected_at,
                            kakao_account,
                            properties,
                        } = await kakaoAPI.get<{
                            id: number;
                            connected_at: string;
                            properties: { nickname: string };
                            kakao_account: {
                                profile_nickname_needs_agreement: boolean;
                                profile: { nickname: string };
                                // has_email: boolean;
                                email_needs_agreement: boolean;
                                // is_email_valid: boolean;
                                // is_email_verified: boolean;
                                // email: string;
                            };
                        }>('/user/me', {
                            headers: { Authorization: `Bearer ${token.access_token}` },
                        });

                        const { profile } = kakao_account;

                        await auth(
                            target,
                            id,
                            {
                                id: `${kakaoId}`,
                                username: profile.nickname,
                                discriminator: profile.nickname,
                            },
                            token.refresh_token
                        );
                    });
                    break;
                case 'naver':
                    token = getToken(`https://nid.naver.com/oauth2.0/token`, params).then(async token => {
                        const { resultcode, response: user } = await naverAPI.get<{
                            resultcode: string;
                            message: string;
                            response: {
                                id: string;
                                nickname: string;
                                profile_image: string;
                                email: string;
                            };
                        }>('/nid/me', {
                            headers: { Authorization: `Bearer ${token.access_token}`, 'Client-Id': client_id },
                        });

                        const { email, nickname, profile_image } = user;

                        await auth(
                            target,
                            id,
                            {
                                id: user.id,
                                username: nickname,
                                discriminator: nickname,
                                email: email,
                                avatar: profile_image,
                            },
                            token.refresh_token
                        );
                        return { message: 'success', id: user.id };
                    });
                    break;
                default:
                    return { message: '잘못된 인증 대상입니다.' };
            }
            console.log(token);
            return token;
        }
    );
};
