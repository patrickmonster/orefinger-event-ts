export type webhook = {
    type: number;
    guild_id: string;
    user_id: string;
    channel_id: string;
    custom_name?: string;
    custom_ment?: string;
    hook_id?: string;
    hook_token?: string;
};
