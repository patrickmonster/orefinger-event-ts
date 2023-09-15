import axios from 'axios';
import { tokens, userRefreshTokenUpdate } from 'controllers/auth';
import { APIActionRowComponent, APIStringSelectComponent } from 'discord-api-types/v10';
import redis from 'utils/redis';

export const getUserToken = async (user_id: string) => {
    const token_id = `token:discord:${user_id}`;

    const [token] = await tokens(user_id, 1);

    if (!token) {
        return { error: 'Token not found' };
    }

    try {
        const tmp = await redis.get(token_id);
        if (tmp && JSON.parse(tmp).refresh_token === token.refresh_token) {
            return JSON.parse(tmp).access_token;
        }
    } catch (e) {}

    const { refresh_token: rt } = token;
    const {
        data: { access_token, token_type, expires_in, refresh_token, scope },
    } = await axios.post<{
        token_type: string; // : 'Bearer',
        access_token: string; // : 'GsWzzu9j13DJCVtQCeNSLnFLVyUudY',
        expires_in: number; // : 604800,
        refresh_token: string; // : 'HStDwH0sSxgEgBcwHEv4MosVlhtEcG',
        scope: string; // : 'identify email'
    }>(
        'https://discord.com/api/oauth2/token',
        {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: rt,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    // 갱신토큰 업데이트
    await userRefreshTokenUpdate({ user_id, refresh_token: refresh_token }, 1);

    redis.set(token_id, JSON.stringify({ access_token, token_type, expires_in, refresh_token, scope }), {
        EX: expires_in,
    });

    return access_token;
};
