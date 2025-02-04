import { FastifyInstance } from 'fastify';
import { getToken, sendAlimTalk } from 'utils/gabiaApiInstance';
import { catchRedis } from 'utils/redis';

export default async (fastify: FastifyInstance, opts: any) => {
    const template_ids = [6, 791, 792]; // 알림톡 템플릿 ID

    fastify.post<{
        Params: { user_id: string; template_id: string };
        Body: {
            template_variable: string;
        };
    }>(
        '/alimtalk/:user_id/:template_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                description: '알림톡을 전송 합니다.',
                summary: '알림톡 전송',
                tags: ['Notice'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        template_id: { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        template_variable: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { user_id, template_id } = req.params;
            const { template_variable } = req.body;

            // 사용자 휴대전화 번호를 가져옴
            const token = await catchRedis(`gabia:token`, getToken, 60 * 60);

            // return {};
            // 알림톡 전송부
            return await sendAlimTalk(token, {
                template_id,
                template_variable,
                phone: '01074412872',
            });
        }
    );
    fastify.get(
        '/alimtalk/:target/:notice_id/:user_id',
        {
            schema: {
                description: '알림톡 배치 버튼',
                summary: '알림톡 배치 버튼',
                tags: ['Notice'],
                deprecated: false,
            },
        },
        (req, res) => {
            res.redirect(`https://orefinger.com`);
        }
    );
};
