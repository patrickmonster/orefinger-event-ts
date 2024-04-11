import { SqlInsertUpdate, calTo, query } from 'utils/database';

export const selectWebhook = async (channelId: string, guildId?: string) =>
    query<{
        channel_id: string;
        webhook_id: string;
        token: string;
        guild_id: string;
        name: string;
        img_idx: number;
        create_at: Date;
        update_at: Date;
        auth_id: string;
    }>(
        `
SELECT
    channel_id
    , webhook_id
    , token
    , guild_id
    , name
    , img_idx
    , create_at
    , update_at
    , auth_id
FROM webhooks w
WHERE 1=1
AND w.guild_id = ?
${calTo('AND w.channel_id = ?', channelId)}
        `,
        guildId
    );

export const upsertWebhook = async (
    channelId: string,
    hook: Partial<{
        webhook_id: string;
        guild_id: string;
        token: string;
        name: string;
        img_idx: number;
        auth_id: string;
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
