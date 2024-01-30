import { APIEmbed } from 'discord-api-types/v10';
import { query } from 'utils/database';

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
    , notice_channel_id
FROM v_notice_channel vnc 
WHERE notice_id = ?
    `,
        ParseInt(notice_id)
    ).then(res => res[0]);
