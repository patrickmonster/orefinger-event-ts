import { upsertSMSLog } from 'controllers/sms';
import { env } from 'process';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';
import { getToken, sendSms } from 'utils/gabiaApiInstance';
import { getMessageId } from 'utils/object';
import { catchRedis } from 'utils/redis';

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
