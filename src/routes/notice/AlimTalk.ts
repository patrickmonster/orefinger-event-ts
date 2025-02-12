import { createAuthNumber, createMessage, deleteAuthNumber, matchAuthNumber } from 'components/sms';
import { authDtil } from 'controllers/auth';
import { FastifyInstance } from 'fastify';
import { decryptByIv, ENCRYPT_KEY } from 'utils/cryptoPw';

// 알림톡 전송용 라우터
export default async (fastify: FastifyInstance, opts: any) => {
    const template_ids = [6, 791, 792]; // 알림톡 템플릿 ID

    const getUserPhone = async (user_id: string) => {
        const user = await authDtil(user_id);
        if (!user || !user.phone) {
            return null;
        }
        user.phone = decryptByIv(user.phone, ENCRYPT_KEY, user.auth_id);

        return user;
    };

    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    fastify.get<{
        Params: { authNum: string };
    }>(
        '/phone/:authNum',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '인증번호로 인증합니다.',
                summary: '사용자 휴대전화 번호',
                tags: ['Notice'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        authNum: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { authNum } = req.params;
            const user_id = req.user.id;

            let phone = await matchAuthNumber(user_id, authNum);
            if (!phone) {
                return { message: '인증번호가 올바르지 않습니다.', code: 400 };
            }

            return { message: '인증되었습니다.', code: 200, phone };
        }
    );

    fastify.post<{
        Body: {
            phone: string;
        };
    }>(
        '/phone',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '인증번호를 발송합니다.',
                summary: '사용자 휴대전화 번호',
                tags: ['Notice'],
                deprecated: false,
                body: {
                    type: 'object',
                    required: ['phone'],
                    properties: {
                        phone: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            let { phone } = req.body;

            if (!phoneRegex.test(phone)) return { message: '휴대전화 번호가 올바르지 않습니다.', code: 400 };

            phone = phone.replace(phoneRegex, '01$1$2$3');

            try {
                const authNum = await createAuthNumber(req.user.id, phone);
                if (!authNum) {
                    return { message: '이미 인증번호가 발송되었습니다.', code: 400 };
                }
                console.log('AUTH NUM', phone, authNum);
                return { message: '인증번호가 발송되었습니다.', code: 200, time: 60 * 5 };
            } catch (e) {
                deleteAuthNumber(req.user.id);
                return { message: '인증번호 발송에 실패하였습니다.', code: 400 };
            }
        }
    );

    fastify.post<{
        Params: { user_id: string };
        Body: { message: string };
    }>(
        '/sms/:user_id/',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '문자메세지를 전송 합니다.',
                summary: '문자 전송',
                tags: ['Notice'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { user_id } = req.params;
            const { message } = req.body;

            const user = await getUserPhone(user_id);

            if (!user) {
                return { message: '사용자 정보를 찾을 수 없습니다.', code: 404 };
            }

            // 알림톡 전송부
            return await createMessage(req.user.id, user.phone, message, 'MSG');
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
