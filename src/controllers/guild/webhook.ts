import { calTo, query } from 'utils/database';

export const selectWebhook = async (channleId: string, guildId?: string) =>
    query<{
        channel_id: string;
        webhook_id: string;
        token: string;
        guild_id: string;
        name: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT channel_id
    , webhook_id
    , token
    , guild_id
    , name
    , create_at
    , update_at
FROM discord.webhooks
WHERE 1=1
AND channel_id = ?
${calTo('AND guild_id = ?', guildId)}
    `,
        channleId
    );
