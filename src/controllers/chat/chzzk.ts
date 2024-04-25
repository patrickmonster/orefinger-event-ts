import { Snowflake } from 'discord-api-types/globals';
import { format, query } from 'utils/database';

export interface ChatLog {
    message_id: Snowflake;
    user_id: string;
    channel_id: string;
    message: string;
    os_type: string;
    hidden_yn: 'Y' | 'N';
}
export const insertChat = async (chat: ChatLog) => query('INSERT IGNORE INTO chat_log SET ?', chat);

/**
 * 다중 insert
 * @param chats
 * @returns
 */
export const insertChatQueue = async (chats: ChatLog[]) => {
    const cols = `(${Array.from({ length: 6 }, (_, i) => '?').join(',')})`;
    return await query(
        `INSERT IGNORE INTO chat_log (message_id, user_id, channel_id, message, os_type, hidden_yn) VALUES ${chats.map(
            chat =>
                format(cols, [
                    chat.message_id,
                    chat.user_id,
                    chat.channel_id,
                    chat.message,
                    chat.os_type,
                    chat.hidden_yn,
                ])
        )}`
    );
};

export const selectChatServer = async (noticeType: number) =>
    query<{
        notice_id: number;
        id: number;
        hash_id: string;
    }>(
        `
SELECT 
	notice_id 
	, id 
	, hash_id
FROM notice_live nl 
LEFT JOIN v_notice vn using(notice_id) 
WHERE 1=1
AND vn.notice_type = ?
AND end_at IS NULL
GROUP BY notice_id
    `,
        noticeType
    );
