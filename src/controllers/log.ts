import { SqlInsertUpdate, query } from 'utils/database';

export const CreateMessage = async (id: string, channel_id: string, result: any, webhook_id?: string) =>
    query<SqlInsertUpdate>(`INSERT INTO discord_log.send_message set ?`, {
        id,
        channel_id,
        result,
        webhook_id,
    });

export const ecsSet = async (id: string, revision: string, family: string) =>
    query<SqlInsertUpdate>(`INSERT INTO task set ? `, {
        id,
        revision,
        family,
    });

export const ecsPing = async (id: string) =>
    query<SqlInsertUpdate>(`UPDATE task SET last_ping=CURRENT_TIMESTAMP WHERE idx=?`, {
        id,
    });
