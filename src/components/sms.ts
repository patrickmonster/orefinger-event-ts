import { ENCRYPT_KEY, encryptByIv } from 'utils/cryptoPw';
import { authRandNum } from 'utils/object';
import { cacheRedis, deleteRedis, loadRedis } from 'utils/redis';
import sleep from 'utils/sleep';

const RedisAuth = (user_id: string) => `auth:phone:${user_id}`;
const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

export const deleteAuthNumber = async (user_id: string) => await deleteRedis(RedisAuth(user_id));

export const createAuthNumber = async (user_id: string, phone: string) => {
    const authNum = authRandNum(6);
    const oldAuth = await loadRedis(RedisAuth(user_id));
    if (oldAuth) {
        return null;
    }

    try {
        await cacheRedis(RedisAuth(user_id), { authNum, phone }, 60 * 5); // 5분
        // await createMessage(user_id, phone, `인증번호는 [${authNum}] 입니다.`, 'auth');
        // await createAlimTalk(user_id, phone, 7, ['방송알리미', authNum], 'auth');
    } catch (e) {
        throw new Error('인증번호 전송 서비스에 인증을 실패하였습니다.');
    }
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

    return phone.replace(phoneRegex, '01$1-$2-****');
};
