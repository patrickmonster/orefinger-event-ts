import { userUpdate } from 'controllers/auth';
import twitch from 'utils/twitchApiInstance';

export type User = {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
};

// https://dev.twitch.tv/docs/api/reference/#get-users
export const getUser = (...id: string[]) => getUsers('id', ...id);

export const usersUpdate = async (...id: string[]) => {
    getUser(...id).then(async ({ data: users }) => {
        // users

        for (const { id, login, display_name, broadcaster_type, profile_image_url } of users) {
            // user_id, user_login, user_name
            await userUpdate({
                user_id: id,
                user_login: login,
                user_name: display_name,
                user_type: broadcaster_type,
                avatar: profile_image_url,
            });
        }
    });
};

// https://dev.twitch.tv/docs/api/reference/#get-users
export const getUsers = (type: string, ...id: string[]) =>
    twitch.get<{
        data: User[];
    }>(`/users?${type}=${id.join(`&${type}=`)}`);

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
    | {
          after: string;
      }
    | string;

export const objectToQueryString = (queryParameters: { [key: string]: string | number | boolean }) =>
    queryParameters
        ? Object.entries(queryParameters).reduce((q, [k, v]) => {
              return `${q}${q.length === 0 ? '?' : '&'}${k}=${encodeURIComponent(v)}`;
          }, '')
        : '';

export const getEventSub = async (query: EventSubQuery) => {
    let targetUrl = '/eventsub/subscriptions';
    if (typeof query === 'string') {
        targetUrl += `?after=${query}`;
    } else {
        targetUrl += objectToQueryString(query);
    }

    console.log('targetUrl', targetUrl);

    return await twitch.get(targetUrl);
};
