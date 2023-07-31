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
export const getUser = (...id: string[]) => twitch.get<{ data: User[] }>(`/users?id=${id.join('&id=')}`).then(({ data: { data } }) => data);
