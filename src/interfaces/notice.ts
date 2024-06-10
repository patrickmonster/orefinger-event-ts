import { RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelWebhookJSONBody } from 'discord-api-types/v10';

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
    notice_id: number;
    guild_id: string;
    channel_id: string;

    channel_type: ChannelType;

    // hook
    url?: string;
    username?: string;
    avatar_url?: string;
}

export interface NoticeChannelHook extends NoticeChannel {
    hook: RESTPostAPIChannelWebhookJSONBody;
    message: RESTPostAPIChannelMessageJSONBody;
}

export interface NoticeDetail {
    notice_id: number;
    hash_id: string;
    notice_type: number;

    name: string;
    message: string;
    // img_idx: number; /* 임시보류 */
}
