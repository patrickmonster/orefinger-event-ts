'use strict';
import axios, { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';
// import redis from './redis';
import sleep from './sleep';

const API_VERSION = 'helix';

/// 이벤트 서브 조회쿼리
export type EventSubQuery =
    | {
          status?:
              | 'enabled'
              | 'webhook_callback_verification_pending'
              | 'webhook_callback_verification_failed'
              | 'notification_failures_exceeded'
              | 'authorization_revoked'
              | 'user_removed';
          type?: string;
          user_id?: string;
      }
    | string;

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const twitch: CustomInstance = axios.create({
    baseURL: `https://api.twitch.tv/${API_VERSION}`,
    headers: {
        authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        'client-id': 'q6batx0epp608isickayubi39itsckt',
    },
});

export default twitch;

export const twitchAPI = axios.create({ baseURL: `https://api.twitch.tv/${API_VERSION}` });

twitch.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async (error: any) => {
        if (error.config && error.response && error.response.status === 429) {
            console.log('Too Many Requests! Retrying...');
            const { message, retry_after } = error.response.data;
            await sleep(Math.ceil(retry_after / 1000) + 1);
            return twitch(error.config);
        }
        throw error;
    }
);

// export const GetToken = async (id: string, sc: string, scope: string[]) => {
//     const token_id = `TOKEN:${id}`;
//     let token;
//     try {
//         token = await redis.get(token_id);
//         if (token) return { token, id, scope };
//     } catch (err) {}

//     console.log('TOKEN] ', id, sc);

//     const { data } = await axios.post(
//         `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${sc}&grant_type=client_credentials&${scope.join('%20')}`
//     );
//     await redis.set(token_id, data.access_token, {
//         EX: data.expires_in - 10,
//     });

//     return { token: data.access_token, id, scope };
// };

// export const GetClientToken = async () =>
//     await GetToken(process.env.TWITCH_CLIENT || '', process.env.TWITCH_SECRET || '', ['channel:read:subscriptions', 'user:read:email']);

// export const GetClientTokenHeader = async () => {
//     const { token, id } = await GetClientToken();

//     console.log('LOADING CLIENT TOKEN', token, id);

//     return { Authorization: `Bearer ${token}`, 'Client-Id': id };
// };

// export const CreateSubscribe = async (target: any) =>
//     await axios.post(
//         'https://api.twitch.tv/helix/eventsub/subscriptions',
//         Object.assign(
//             {
//                 version: '1',
//                 transport: {
//                     method: 'webhook',
//                     callback: `https://event.orefinger.click/event/twitch`,
//                     secret: `${process.env.TWITCH_EVENTSUB_SECRET || '12345678901234567890'}`,
//                 },
//             },
//             target
//         ),
//         {
//             headers: await GetClientTokenHeader(),
//         }
//     );

// export const GetSubscribe = async (query: EventSubQuery) => {
//     let targetUrl = '/eventsub/subscriptions';
//     if (typeof query === 'string') {
//         targetUrl += `?after=${query}`;
//     } else {
//         targetUrl += `?${Object.entries(query)
//             .map(([key, value]) => `${key}=${value}`)
//             .join('&')}`;
//     }

//     console.log('GetSubscribe', targetUrl);

//     return twitchAPI.get<{
//         total: number;
//         data: {
//             id: string;
//             status: string;
//             type: string;
//             version: string;
//             condition: any;
//             created_at: string;
//             cost: number;
//         }[];
//         max_total_cost: number;
//         total_cost: number;
//         pagination: {
//             cursor?: string;
//         };
//     }>(targetUrl, {
//         headers: await GetClientTokenHeader(),
//     });
// };
