import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Params: { channel_id: number };
    }>(
        '/servers',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '인프라 정보 조회',
                tags: ['Infra'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        channel_id: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            return 1;
        }
    );
};
