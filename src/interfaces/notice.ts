import {
    APIEmbed,
    APIMessage,
    RESTPostAPIChannelMessageJSONBody,
    RESTPostAPIWebhookWithTokenJSONBody,
} from 'discord-api-types/v10';

export interface NoticeBat {
    notice_id: number;
    hash_id: string;
    id: number;
    notice_type: number;
    notice_type_tag: string;
    message: string;
    name: string;
    img_idx: number;

    channels: Array<NoticeChannel>;
}

export enum ChannelType {
    TEXT = 0,
    WEBHOOK = 1,
}

export interface NoticeChannel {
    content?: string;

    channel_id: string;
    notice_id: number;
    guild_id: string;
    create_at: string;
    update_at: string;
    url: string | null;
    channel_type: ChannelType;
    embed: APIEmbed;

    avatar_url?: string | null; // 채널 아이콘
    username?: string | null; // 채널 닉네임

    name: string;
}
export interface NoticeChannelHook extends NoticeChannel {
    message: RESTPostAPIChannelMessageJSONBody | RESTPostAPIWebhookWithTokenJSONBody;
}

export interface NoticeDetail {
    notice_id: number;
    hash_id: string;
    notice_type: number;

    name: string;
    message: string;

    update_user_id: string;
    // img_idx: number; /* 임시보류 */
}

export interface OriginMessage {
    url: string;
    message: APIMessage;
    id: string;
    channel_type: ChannelType;
}
