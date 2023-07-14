import axios from 'axios';
import redis from 'utils/redis';

const scope = ['channel:read:subscriptions', 'user:read:email']; // 권한

export const getToken = async (id: string, sc: string) => {
    let token;

    try {
        token = await redis.get(`token:${id}`);
        if (token) return { token, id, scope };
    } catch (e) {}

    try {
        const { data } = await axios.post(
            `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${sc}&grant_type=client_credentials&scope=${scope.join('%20')}`
        );
        await redis.set(`token:${id}`, data.access_token, {
            EX: data.expires_in - 10,
        });

        console.log({ message: '토큰 발급', data });

        return { token: data.access_token, id, scope };
    } catch (e) {
        console.error({ message: '토큰 발급 실패', e });
        throw e;
    }
};

export const getClientToken = () => getToken(process.env.TWITCH_CLIENT_ID!, process.env.TWITCH_CLIENT_SECRET!);
export const getClientTokenHeader = async () => {
    const { token, id } = await getClientToken();
    return { Authorization: `Bearer ${token}`, 'Client-Id': id };
};

export const createSubscribe = async (target: any) => {
    try {
        await axios.post(
            'https://api.twitch.tv/helix/eventsub/subscriptions',
            Object.assign(
                // 구독
                {
                    version: '1',
                    transport: {
                        method: 'webhook',
                        callback: `https://event.orefinger.click/event/twitch`,
                        secret: `${process.env.TWITCH_EVENTSUB_SECRET || '12345678901234567890'}`,
                    },
                },
                target // 목표
            ),
            {
                headers: await getClientTokenHeader(),
            }
        );
    } catch (e) {
        console.log('EVENTSUB] 알림등록 실패', e);
    }
};

export const unSubscribe = async (id: string) => {
    try {
        await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
            headers: await getClientTokenHeader(),
        });
    } catch (e) {
        console.log('EVENTSUB] 알림해제 실패', e);
    }
};
