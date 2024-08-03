import axios from 'axios';
import { webhookCreate } from 'components/discord';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Params: { channel: string };
        Querystring: { name: string };
    }>(
        '/webhook/:channel',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Bearer: [] }],
                description: '훅을 생성합니다.',
                summary: '훅 생성',
                tags: ['Notice'],
                deprecated: false,
                querystring: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', description: '훅 이름' },
                    },
                },
            },
        },
        async req => webhookCreate(req.params.channel, { name: req.query.name, auth_id: req.user.id }, 'Y')
    );

    fastify.post<{
        Params: { channel: string; id: string };
        Querystring: { name: string };
    }>(
        '/webhook/:channel/:id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '훅을 생성합니다.',
                summary: '훅 생성',
                tags: ['Admin'],
                deprecated: false,
                querystring: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', description: '훅 이름' },
                    },
                },
                params: {
                    type: 'object',
                    required: ['channel', 'id'],
                    properties: {
                        channel: { type: 'string', description: '채널 ID' },
                        id: { type: 'string', description: '소유자' },
                    },
                },
            },
        },
        async req =>
            webhookCreate(req.params.channel, { name: req.query.name, auth_id: req.params.id }, 'Y').then(webhook => {
                const { url } = webhook;

                if (url) {
                    axios.post(url, {
                        content: `
안녕~ 반가워~!

어머나! 여기에 관리자가 왔다갔나봐요...!
이제부터, 현재 프로필을 통해서 알림을 받을 수 있어요!
(이거완전 러키알림잔앙 ( •̀ ω •́ )✧)
                        `,
                    });
                }

                return webhook;
            })
    );
};
