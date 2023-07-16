import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createYutubeUser, createYutubeChannel, createYutubeEvent, insertYoutubeVideo } from 'controllers/youtube';

import redis from 'utils/redis';

import { liveList } from 'controllers/notification';

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
};
