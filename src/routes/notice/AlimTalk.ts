import { createMessage } from 'components/sms';
import { authDtil, updatePhone } from 'controllers/auth';
import { FastifyInstance } from 'fastify';
import { decryptByIv, ENCRYPT_KEY, encryptByIv } from 'utils/cryptoPw';
import { getToken } from 'utils/gabiaApiInstance';
import { authRandNum } from 'utils/object';
import { cacheRedis, catchRedis, loadRedis } from 'utils/redis';
import sleep from 'utils/sleep';

// 알림톡 전송용 라우터
export default async (fastify: FastifyInstance, opts: any) => {
    const template_ids = [6, 791, 792]; // 알림톡 템플릿 ID

    const RedisAuth = (user_id: string) => `auth:phone:${user_id}`;

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

            const auth = await loadRedis<{ authNum: string; phone: string }>(RedisAuth(user_id));

            if (!auth || auth.authNum !== authNum) {
                return { message: '인증번호가 올바르지 않습니다.', code: 400 };
            }

            // 휴대전화 정보 암호화
            const content = encryptByIv(auth.phone, ENCRYPT_KEY, user_id);

            await sleep(3 * 1000); // 3초 대기
            await updatePhone(user_id, content);

            return { message: '인증되었습니다.', code: 200 };
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

            const authNum = authRandNum(); // 인증번호 생성
            const oldAuth = await loadRedis(RedisAuth(req.user.id));
            if (oldAuth) {
                return { message: '이미 인증번호가 발송되었습니다.', code: 400 };
            }

            cacheRedis(
                RedisAuth(req.user.id),
                {
                    authNum, // 인증번호
                    phone, // 휴대전화 번호
                },
                60 * 5
            ); // 인증번호 캐시에 저장 (5분)

            console.log(`${req.user.id} :: ${authNum}`);

            await createMessage(req.user.id, phone, `방송알리미 인증번호는 [${authNum}] 입니다.`, 'AUTH');

            return { message: '인증번호가 발송되었습니다.', code: 200, time: 60 * 5 };
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
            // 사용자 휴대전화 번호를 가져옴
            const token = await catchRedis(`gabia:token`, getToken, 60 * 60);

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
