import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createYutubeUser, createYutubeChannel, createYutubeEvent, insertYoutubeVideo } from 'controllers/youtube';

import redis from 'utils/redis';
import { getUser } from 'components/twitch';

import { liveList, total, stream } from 'controllers/notification';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'notifyEventChannel',
        type: 'object',
        properties: {
            user_id: { type: 'string', description: '트위치 유저 아이디' },
            name: { type: 'string', description: '채널에 전송하는 프로필 정보' },
            channel_id: { type: 'string', description: '채널 아이디' },
            custom_ment: { type: 'string', description: '채널 전용 맨트' },
            url: { type: 'string', description: '전송 url' },
            create_at: { type: 'string', description: '생성일' },
            update_at: { type: 'string', description: '수정일' },
            tag: { type: 'string', description: '' },
            tag_id: { type: 'number' },
            tag_name: { type: 'string' },
        },
    });

    fastify.get(
        '',
        {
            // onRequest: [fastify.authenticate],
            schema: {
                description: '최근 방송중인 50개의 알림 리스트를 불러옵니다.',
                tags: ['Notification'],
                deprecated: false, // 비활성화
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                auth_id: { type: 'string' },
                                event_id: { type: 'string' },
                                type: { type: 'string' },
                                create_at: { type: 'string' },
                                live_type: { type: 'string' },
                                tag: { type: 'string' },
                                login: { type: 'string' },
                                name: { type: 'string' },
                                user_type: { type: 'string' },
                                title: { type: 'string' },
                                game_id: { type: 'string' },
                                game_name: { type: 'string' },
                                attendance: { type: 'number', description: '출석인원' },
                            },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            // error: { type: 'string' },
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async req => await liveList()
    );

    // 통계 정보 조회
    fastify.get(
        '/total',
        {
            schema: {
                description: '사용자 통계 정보를 불러옵니다.',
                tags: ['Notification'],
                deprecated: false, // 비활성화
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            S: { type: 'string' },
                            T: { type: 'string' },
                            totalGuld: { type: 'string' },
                            totalUser: { type: 'string' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            // error: { type: 'string' },
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        async req => {
            return await total().then(([item]) => item);
        }
    );

    // 스트리머 정보 조회
    fastify.get(
        '/streamers',
        {
            schema: {
                description: '파트너 스트리머 리스트',
                tags: ['Notification'],
                deprecated: false, // 비활성화
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                login: { type: 'string' },
                                display_name: { type: 'string' },
                                type: { type: 'string' },
                                broadcaster_type: { type: 'string' },
                                description: { type: 'string' },
                                profile_image_url: { type: 'string' },
                                offline_image_url: { type: 'string' },
                                view_count: { type: 'number' },
                                created_at: { type: 'string' },
                            },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async req => {
            try {
                const datas = await redis.get('streamers');
                if (datas) return JSON.parse(datas);
            } catch (e) {}
            const data = await stream().then(list => {
                let users = list.map(({ user_id }) => user_id);
                return getUser(...users)
                    .then(data => {
                        console.log(data);

                        redis.set('streamers', JSON.stringify(data), {
                            EX: 60 * 60 * 24, // 하루동안 유효
                        });
                        return data;
                    })
                    .catch(e => {
                        console.log(e);

                        return { error: e.message };
                    });
            });
            console.log(data);
            return data;
        }
    );
};
