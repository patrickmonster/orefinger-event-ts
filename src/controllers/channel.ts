import getConnection, { calTo, query, SqlInsertUpdate } from 'utils/database';

type OnlineChannelsProps = {
    channels_id?: string[];
    user_id?: string;
};
export const onlineChannels = ({ channels_id, user_id }: OnlineChannelsProps) =>
    query<{
        type: number;
        user_id: string;
        name: string;
        channel_id: string;
        custom_ment: string;
        url: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT \`type\`, user_id, name, channel_id, custom_ment, url, create_at, update_at 
FROM v_event_channel vec 
WHERE 1=1
${calTo('AND user_id = ?', user_id)}
${calTo('AND channel_id in (?)', channels_id)}`,
        user_id,
        channels_id
    );

export const eventChannels = ({ channels_id, user_id }: OnlineChannelsProps) =>
    query<{
        type: number;
        user_id: string;
        name: string;
        guild_id: string;
        channel_id: string;
        custom_ment: string;
        hook_id: string;
        hook_token: string;
        delete_yn: string;
        create_at: string;
        update_at: string;
    }>(`
SELECT \`type\`, user_id, name, guild_id, channel_id, custom_ment, hook_id, hook_token, delete_yn, create_at, update_at 
FROM event_channel
WHERE 1=1
${calTo('AND user_id = ?', user_id)}
${calTo('AND channel_id in (?)', channels_id)}`);

type ChannelUpsertProps = {
    channel_id: string;
    guild_id: string;
    name: string;
    type: number;
};
export const channelUpsert = async (props: ChannelUpsertProps[]) =>
    getConnection(async query => {
        const out = {
            affectedRows: 0,
            changedRows: 0,
            insertId: [] as number[],
        };
        for (const prop of props) {
            try {
                const { affectedRows, changedRows, insertId } = await query<SqlInsertUpdate>(
                    `INSERT INTO channel SET ? ON DUPLICATE KEY UPDATE ?`,
                    prop,
                    {
                        guild_id: prop.guild_id,
                        name: prop.name,
                        type: prop.type,
                    }
                );
                out.affectedRows += affectedRows;
                out.changedRows += changedRows;
                out.insertId.push(insertId);
            } catch (error) {
                console.error('CHANNEL UPSERT ERROR', error);
            }
        }
        return out;
    });
