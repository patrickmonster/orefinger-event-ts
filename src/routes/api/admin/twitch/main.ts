import { FastifyInstance } from 'fastify';

import twitch from 'utils/twitchApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { user_id: string };
    }>(
        '/user/:user_id',
        {
            schema: {
                description: '출석체크',
                tags: ['Twitch'],
                deprecated: false, // 비활성화
                params: {
                    type: 'object',
                    required: ['user_id'],
                    additionalProperties: false,
                    properties: {
                        user_id: { type: 'string', description: 'User id' },
                    },
                },
            },
        },
        async req => {
            const { user_id } = req.params;

            return twitch.get(`/users?login=${user_id}`);
        }
    );
};
