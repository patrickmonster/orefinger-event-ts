import { query, SqlInsertUpdate, selectPaging } from 'utils/database';

export const CreateMessage = async (id: string, channel_id: string, result: any, webhook_id?: string) =>
    query<SqlInsertUpdate>(`INSERT INTO discord_log.send_message set ?`, {
        id,
        channel_id,
        result,
        webhook_id,
    });
