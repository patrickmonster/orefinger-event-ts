import getConnection, { SqlInsertUpdate } from 'utils/database';

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
