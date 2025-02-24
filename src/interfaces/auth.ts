import { YN } from 'utils/database';

export type Auth_id = string;

export interface AuthUser {
    id: string;
    username?: string;
    discriminator?: string;
    email?: string;
    avatar?: string;
}
export interface Auth {
    auth_id: string;
    name: string;
    username: string;
    tag: string;
    avatar: string;
    create_at: string;
    update_at: string;
    phone: string;
}
export interface AuthType {
    auth_type: number;
    tag: string;
    tag_kr: string;
    create_at: string;
    use_yn: string;
    scope: string;
    client_id: string;
    client_sc: string;
    target: string;
    logout_url: string;
}
export type deleteAuthConnectionAuthTypes =
    | 'discord'
    | 'twitch.stream'
    | 'twitch'
    | 'tiktok'
    | 'afreecatv'
    | 'kakao'
    | 'youtube'
    | 'toss'
    | 'toss.test';
export interface UserId {
    auth_type: number;
    tag: string;
    tag_kr: string;
    user_id: string;
    login: string;
    name: string;
    name_alias: string;
    avatar: string;
    is_session: boolean;
    create_at: string;
}
export interface AuthToken {
    type: number;
    type_kr: string;
    user_id: string;
    auth_id: string;
    login: string;
    name: string;
    user_type: number;
    email: string;
    avatar: string;
    refresh_token: string;
    is_session: string;
    create_at: string;
    update_at: string;
}
export interface UserInfo {
    type: number;
    tag: string;
    tag_kr: string;
    user_id: string;
    auth_id: string;
    login: string;
    name: string;
    kr_name: string;
    user_type: number;
    email: string;
    avatar: string;
    avatar_id: string;
    refresh_token: string;
    is_session: YN;
    create_at: string;
    update_at: string;
}
export interface AuthBadge {
    user_id: string;
    auth_id: string;
    login: string;
    name: string;
    kr_name: string;
    user_type: string;
    avatar: string;
}
