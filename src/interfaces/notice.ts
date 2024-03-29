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
export interface NoticeChannel {
    notice_id: number;
    guild_id: string;
    channel_id: string;
    use_yn: string;
    update_at: Date;
}

export interface NoticeDetail {
    notice_id: number;
    hash_id: string;
    notice_type: number;

    name: string;
    message: string;
    // img_idx: number; /* 임시보류 */
}
