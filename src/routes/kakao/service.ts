import { FastifyInstance } from 'fastify';

/**
 * 카카오 봇 서비스
 *  - 카카오 봇 서비스 관련 API를 제공합니다.
 */
export default async (fastify: FastifyInstance, opts: any) => {
    // 카카오 봇 서비스 정보 조회
    fastify.addSchema({
        $id: 'kakaoID',
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: { type: 'string', description: 'ID' },
            name: { type: 'string', description: '이름' },
        },
    });

    fastify.addSchema({
        $id: 'kakaoReq',
        type: 'object',
        properties: {
            intent: { $ref: 'kakaoID#', description: '블록 정보' },
            userRequest: {
                type: 'object',
                required: ['timezone', 'params', 'block', 'utterance', 'user'],
                properties: {
                    timezone: { type: 'string', description: '시간대' },
                    params: { type: 'object', description: '파라미터' },
                    block: { $ref: 'kakaoID#', description: '블록 정보' },
                    utterance: { type: 'string', description: '발화 내용' },
                    lang: { type: 'string', description: '언어' },
                    user: {
                        type: 'object',
                        required: ['id', 'type', 'properties'],
                        properties: {
                            id: { type: 'string', description: '유저 ID' },
                            type: { type: 'string', description: '유저 타입' },
                            properties: { type: 'object', description: '유저 정보' },
                        },
                    },
                },
            },
            bot: { $ref: 'kakaoID#', description: '블록 정보' },
            action: {
                allOf: [
                    { $ref: 'kakaoID#', description: '블록 정보' },
                    {
                        type: 'object',
                        required: ['clientExtra', 'params', 'detailParams'],
                        properties: {
                            clientExtra: { type: 'null', description: '클라이언트 추가' },
                            params: { type: 'object', description: '파라미터' },
                            detailParams: { type: 'object', description: '상세 파라미터' },
                        },
                    },
                ],
            },
        },
    });

    fastify.get<{
        Params: { channel_id: number };
    }>(
        '/',
        {
            schema: {
                description: '카카오봇 - 방송알리미 정보 조회',
                tags: ['KakaoBot'],
                deprecated: false,
                params: {
                    $ref: 'kakaoReq#',
                },
            },
        },
        async req => {
            //

            return {
                version: '2.0',
                tamplate: {
                    outputs: [
                        {
                            simpleText: {
                                text: '안녕하세요. 방송알리미입니다.',
                            },
                        },
                    ],
                },
            };
        }
    );
};
