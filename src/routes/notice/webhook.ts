import { webhookCreate } from 'components/discord';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Params: { channel: string };
        Querystring: { name: string };
    }>(
        '/webhook/:channel',
        {
            onRequest: [fastify.authenticate],
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
        async req => webhookCreate(req.params.channel, { name: req.query.name, auth_id: req.user.id })
    );
};
