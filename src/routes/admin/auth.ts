import { auth } from 'controllers/auth';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Params: { authId: string; target: string };
        Body: {
            hashKeyId: string;
            nickname: string;
            profileImageUrl: string;
        };
    }>(
        '/add/:target/:authId',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '사용자 계정 추가',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        authId: { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        hashKeyId: { type: 'string' },
                        nickname: { type: 'string' },
                        profileImageUrl: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const {
                params: { authId, target },
                body: { hashKeyId, nickname, profileImageUrl },
            } = req;

            return await auth(
                target,
                authId,
                {
                    id: hashKeyId,
                    username: nickname,
                    discriminator: nickname,
                    email: '-',
                    avatar: profileImageUrl,
                },
                '-'
            );
        }
    );
};
