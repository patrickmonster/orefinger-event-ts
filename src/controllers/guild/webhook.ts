import { SqlInsertUpdate, query } from 'utils/database';

export const upsertWebhook = async (
    channelId: string,
    hook: Partial<{
        webhook_id: string;
        guild_id: string;
        token: string;
        name: string;
        img_idx: number;
        auth_id: string;
        use_yn: 'Y' | 'N';
    }>
) =>
    query<SqlInsertUpdate>(
        `INSERT INTO webhooks SET ? ON DUPLICATE KEY UPDATE ?`,
        {
            ...hook,
            channel_id: channelId,
        },
        hook
    );
