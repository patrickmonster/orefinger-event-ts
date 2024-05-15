import { Snowflake } from 'discord-api-types/globals';
import getConnection, { SqlInsertUpdate, calTo, format, query } from 'utils/database';

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
    if (!chats.length) return;
    console.log(chats);

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectChatUsers = async (roomId: string) =>
    query<{
        channel_id: string;
        user_id: string;
        point: number;
    }>(
        `
SELECT
	channel_id
	, user_id
	, \`point\`
FROM chat_user_connect cuc
WHERE 1=1
AND channel_id = ?
    `,
        roomId
    );

export const upsertChatUser = async (
    ...users: {
        channel_id: string;
        user_id: string;
        point?: number;
    }[]
) =>
    getConnection(async query => {
        if (!users.length) return;
        for (const user of users) {
            query(
                'INSERT INTO chat_user_connect SET ? ON DUPLICATE KEY UPDATE update_at=CURRENT_TIMESTAMP, point=?',
                user,
                user.point || 0
            );
        }
    }, true);

export const selectCommand = async (channel_id: string) =>
    query<{
        command: string;
        answer: string;
        count: number;
        type: number;
    }>(
        `
SELECT
    cc.command
    , cc.message as answer
    , cc.type
    , cc.count
    , cc.use_yn
FROM chat_cmd cc
WHERE 1=1
AND channel_id = ?
    `,
        channel_id
    );

export const selectCommandType = async () =>
    query<{
        type: number;
        name: string;
    }>(
        `
SELECT \`type\`, name
FROM chat_cmd_type cct 
WHERE 1=1
AND use_yn = 'Y'
    `
    );

export const upsertCommands = async (
    channel_id: string,
    ...commands: {
        command: string;
        message: string;
        type: number;
    }[]
) =>
    getConnection(async query => {
        const cols = `(${Array.from({ length: 4 }, (_, i) => '?').join(',')})`;
        //
        await query('DELETE FROM chat_cmd WHERE channel_id = ?', channel_id);
        if (commands.length)
            await query(
                `INSERT IGNORE INTO chat_cmd (channel_id, command, message, type) VALUES ${commands.map(
                    ({ command, message, type }) => format(cols, [channel_id, command, message, type])
                )}`
            );
    }, true);

export const upsertCommand = async (
    channel_id: string,
    commands: {
        command: string;
        message: string;
        type: number;
    }
) =>
    query<SqlInsertUpdate>(
        `INSERT INTO chat_cmd SET ? ON DUPLICATE KEY UPDATE ?`,
        {
            channel_id,
            ...commands,
        },
        commands
    );

export const deleteCommand = async (channel_id: string, command: string) =>
    query<SqlInsertUpdate>(`DELETE FROM chat_cmd WHERE channel_id=? AND command=?`, channel_id, command);

export const upsertChatPermission = async (user_id: string, channel_id: string, permission: string) => {
    getConnection(async query => {
        const item = await query<{
            idx: number;
            name: string;
        }>(
            `
SELECT \`type\` as key, name
FROM chat_permission_type cpt
WHERE 1=1
AND name = ?
        `,
            permission
        ).then(([row]) => row);

        if (!item) {
            return Promise.reject('권한이 없습니다.');
        }

        return await query(
            'INSERT INTO chat_permission SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP',
            {
                user_id,
                channel_id,
                permission: item.idx,
            },
            {
                permission: item.idx,
            }
        );
    });
};

export const selectChatPermission = async (channelId: string, user_id?: string) =>
    query<{
        channel_id: string;
        user_id: string;
        type: number;
        create_at: Date;
    }>(
        `
SELECT channel_id
    , user_id
    , \`type\`
    , create_at
FROM chat_permission
WHERE 1=1
${calTo('AND user_id = ?', user_id)}
AND channel_id = ?
        `,
        channelId
    );

/**
 * 채팅 별칭 조회
 * @param channelId
 * @param user_id
 * @returns
 */
export const selectChatAlias = async () =>
    query<{
        permission: number;
    }>(
        `
SELECT idx
    , origin
    , description
    , create_at
    , use_ym
FROM discord.chat_alias
WHERE 1=1
AND use_ym = 'Y'
        `
    );

export const callCommand = async (channel_id: string, command: string) =>
    query('UPDATE chat_cmd SET count= count + 1 WHERE channel_id=? AND command=?', channel_id, command);
