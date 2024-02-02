import { APIEmbed } from 'discord-api-types/v10';
import getConnection, { query } from 'utils/database';

export type NoticeId = number | string;

export const ParseInt = (id: NoticeId) => (typeof id == 'string' ? parseInt(id) : id);

export const list = async () =>
    query<{
        notice_type_id: number;
        notice_type_tag: string;
    }>("select notice_type_id, tag as notice_type_tag from notice_type nt WHERE nt.use_yn = 'Y'");

// ========================================================================================================
// select embed
/**
 * 컴포넌트 디테일 정보를 Embde 형태로 반환합니다.
 * @param component_id
 * @returns
 */
export const selectNoticeDtilByEmbed = async (notice_id: NoticeId) =>
    query<{ embed: APIEmbed; channel_id: string; notice_channel_id: string }>(
        `
SELECT 
    JSON_OBJECT(
        'title', CONCAT(notice_type_tag, ' - 알림'),
        'description', CONCAT(
            notice_channel_id ,' : ','<#', channel_id ,'>',
            '\n',  date_format(update_at, '%Y-%m-%d'), '에 마지막으로 업데이트 됨'
        )
    ) AS embed
    , channel_id
    , notice_id
FROM v_notice_channel vnc 
WHERE notice_id = ?
    `,
        ParseInt(notice_id)
    ).then(res => res[0]);

export const upsertNoticeChannels = async (notice_id: NoticeId, guild_id: string, channel_ids: string[]) =>
    getConnection(async query => {
        await query(
            `
UPDATE notice_channel 
SET use_yn = 'N', update_at = CURRENT_TIMESTAMP
WHERE notice_id = ? AND guild_id = ? AND channel_id NOT IN (?)
            `,
            notice_id,
            guild_id,
            channel_ids
        );

        query(
            `
INSERT INTO notice_channel 
SET ? ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP
        `,
            {
                notice_id,
                guild_id,
                channel_id: channel_ids,
            }
        );
    }, true);

//
export const upsertNotice = async (notice_id: NoticeId, channel_id: string) => {};
