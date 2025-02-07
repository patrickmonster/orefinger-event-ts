import { updatePhone } from 'controllers/auth';
import { upsertSMSLog } from 'controllers/sms';
import { env } from 'process';
import { ENCRYPT_KEY, encryptByIv, sha256 } from 'utils/cryptoPw';
import { getToken, sendSms } from 'utils/gabiaApiInstance';
import { authRandNum, getMessageId } from 'utils/object';
import { cacheRedis, catchRedis, loadRedis } from 'utils/redis';
import sleep from 'utils/sleep';

const RedisAuth = (user_id: string) => `auth:phone:${user_id}`;
const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

export const createAuthNumber = async (user_id: string, phone: string) => {
    const authNum = authRandNum(6);
    const oldAuth = await loadRedis(RedisAuth(user_id));
    if (oldAuth) {
        return null;
    }

    await cacheRedis(RedisAuth(user_id), { authNum, phone }, 60 * 5); // 5분
    await createMessage(user_id, phone, `인증번호는 [${authNum}] 입니다.`, 'auth');

    return authNum;
};

/**
 * 인증번호 유효 검사
 * @param user_id
 * @param authNum
 * @returns
 */
export const matchAuthNumber = async (user_id: string, authNum: string) => {
    const data = await loadRedis<{ authNum: string; phone: string }>(RedisAuth(user_id));
    if (!data) return null;
    const { authNum: originAuthNum, phone } = data;

    if (originAuthNum != authNum) {
        return null;
    }

    // 휴대전화 정보 암호화
    const content = encryptByIv(phone, ENCRYPT_KEY, user_id);

    await sleep(3 * 1000); // 3초 대기

    await updatePhone(user_id, content);

    return phone.replace(phoneRegex, '01$1-$2-****');
};

export const createMessage = async (user_id: string, phone: string, message: string, type: string) => {
    const token = await catchRedis(`gabia:token`, getToken, 60 * 60);
    const message_id = getMessageId(Date.now(), user_id);
    const callback = env.PHONE;

    if (callback === undefined) {
        throw new Error('PHONE is not defined');
    }

    const phoneKey = sha256(phone, ENCRYPT_KEY);

    return await sendSms<{
        code: string;
        message: string;
        data?: string;
    }>(token, {
        refkey: message_id,
        callback,
        message,
        phone,
    })
        .then(async res =>
            upsertSMSLog(message_id, {
                message,
                type,
                is_send: 'Y',
                return_message: JSON.stringify(res.data),
                phone: phoneKey,
            })
        )
        .catch(async e =>
            upsertSMSLog(message_id, {
                message,
                type,
                is_send: 'N',
                return_message: JSON.stringify(e?.data || { ERROR: 404 }),
                phone: phoneKey,
            })
        );
};
