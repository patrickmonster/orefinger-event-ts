'use strict';
import { FastifyInstance } from 'fastify';

import { discord, userIds } from 'controllers/auth';
import { openApi } from 'utils/discordApiInstance';
import axios from 'axios';

import qs from 'querystring';

//https://discord.com/oauth2/authorize?client_id=826484552029175808&permissions=1249768893497&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fauth%2Fdiscord&response_type=code&scope=identify%20email%20bot%20applications.commands%20guilds%20guilds.members.read
//https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fresponse_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Flocalhost:3000%252Fcallback%26scope%3Didentify%2520email%26client_id%3D826484552029175808
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
                // onRequest: [fastify.authenticate],
                // security: [{ bearerAuth: [] }],
                schema: {
                    description: '디스코드 사용자 인증 - 로컬 테스트용',
                    tags: ['Auth'],
                    deprecated: false, // 비활성화
                    params: {
                        type: 'object',
                        required: ['user_id'],
                        additionalProperties: false,
                        properties: {
                            user_id: { type: 'string', description: '사용자 아이디', enum: ['466950273928134666'] },
                        },
                    },
                    response: {
                        200: { type: 'object', properties: { token: { type: 'string', description: 'access token' } } },
                        400: { type: 'object', properties: { message: { type: 'string', description: '에러 메세지' } } },
                    },
                },
            },
            async (req, res) => {
                const { user_id } = req.params;
                const token = fastify.jwt.sign({ access_token: '?', id: user_id });
                return { token };
            }
        );
    }

    fastify.get(
        '/auth',
        {
            // onRequest: [fastify.authenticate],
            // security: [{ Bearer: [] }],
            schema: {
                description: '디스코드 사용자 인증 - 필수 데이터',
                tags: ['Auth'],
                deprecated: false, // 비활성화
            },
        },
        async req => {
            const scopes = ['identify', 'email'];

            return {
                client_id: process.env.DISCORD_CLIENT_ID,
                scopes,
                permissions: 1249768893497,
            };
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

    // 인증 모듈
    fastify.post<{
        Body: {
            code: string;
            redirect_uri: string;
        };
    }>(
        '/auth',
        {
            // onRequest: [fastify.authenticate],
            // security: [{ Bearer: [] }],
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
                    const jwt = fastify.jwt.sign(
                        { access_token, id: user.id },
                        {
                            expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
                        }
                    );
                    return { user, jwt };
                })
                .catch(e => {
                    console.error(e);
                    throw { message: e.message };
                });
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
                        target: { type: 'string', description: '인증 대상', enum: ['twitch', 'twitch.stream', 'kakao'] },
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
        async (req, res) => {
            const { target } = req.params;
            const { code, redirect_uri } = req.body;

            let token;
            switch (target) {
                case 'twitch':
                    token = await getToken(
                        `https://id.twitch.tv/oauth2/token`,
                        qs.stringify({
                            client_id: process.env.TWITCH_CLIENT_ID,
                            client_secret: process.env.TWITCH_CLIENT_SECRET,
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri,
                        })
                    ).then(async token => {
                        const user = await openApi.get('/users/@me', {
                            headers: { Authorization: `Bearer ${token.access_token}` },
                        });
                        // .then(({ data }) => twitch(data, token.refresh_token));
                    });
                    break;
                case 'twitch.stream':
                    token = getToken(
                        `https://id.twitch.tv/oauth2/token`,
                        qs.stringify({
                            client_id: process.env.TWITC_ID,
                            client_secret: process.env.TWITCH_SECRET,
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri,
                        })
                    ).then(async token => {
                        const user = await openApi.get('/users/@me', {
                            headers: { Authorization: `Bearer ${token.access_token}` },
                        });
                        // .then(({ data }) => twitch(data, token.refresh_token));
                    });
                    break;
                case 'kakao':
                    token = getToken(
                        `https://kauth.kakao.com/oauth/token`,
                        qs.stringify({
                            client_id: process.env.KAKAO_CLIENT_ID,
                            client_secret: process.env.KAKAO_CLIENT_SECRET,
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri,
                        })
                    ).then(async token => {});
                    break;
                default:
                    return { message: '잘못된 인증 대상입니다.' };
            }
            console.log(token);
            return token;
        }
    );
};
