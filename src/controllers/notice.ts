import {
    APIEmbed,
    APIModalInteractionResponseCallbackData,
    APISelectMenuDefaultValue,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import { NoticeDetail } from 'interfaces/notice';
import getConnection, { SqlInsertUpdate, calTo, format, query } from 'utils/database';

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
export const selectNoticeDtilByEmbed = async (notice_id: NoticeId, guild_id: string) =>
    query<{ embed: APIEmbed; channels: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Channel>[] }>(
        `
SELECT 
    JSON_OBJECT(
        'title', nd.name, 
        'description', CONCAT(
            'message : ', nd.message
        ) 
    ) AS embed
    , (
        select json_arrayagg(
                JSON_OBJECT(
                    'id', nc.channel_id,
                    'type', 'channel'
                ) 
            )
        from notice_channel nc 
        WHERE guild_id = ?
        AND nc.notice_id = n.notice_id
        AND nc.use_yn = 'Y'
    ) as channels
from notice n
INNER JOIN notice_detail nd using(notice_id)
WHERE 1=1
AND notice_id = ?
    
    `,
        guild_id,
        ParseInt(notice_id)
    ).then(res => res[0]);

export const deleteOrInsertNoticeChannels = async (notice_id: NoticeId, guild_id: string, channel_ids: string[]) =>
    getConnection(async query => {
        await query(
            `
UPDATE notice_channel 
SET use_yn = 'N', update_at = CURRENT_TIMESTAMP
WHERE notice_id = ? AND guild_id = ?
${calTo(`AND channel_id NOT IN (?)`, channel_ids)}
                `,
            notice_id,
            guild_id
        );

        // 다중 insert
        if (channel_ids && channel_ids.length)
            query(
                `
INSERT INTO notice_channel (notice_id, guild_id, channel_id, use_yn)
VALUES ${channel_ids.map(channel_id => format('(?)', [[notice_id, guild_id, channel_id, 'Y']])).join(',')}
ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP
            `
            );
    }, true);

export const upsertNotice = async (notiecData: Partial<NoticeDetail>, noChageOrigin?: boolean) =>
    getConnection(async query => {
        console.log('notiecData', notiecData);
        let id = notiecData.notice_id;
        if (id === undefined) {
            const notice = await query<SqlInsertUpdate>(
                `INSERT INTO notice SET ? ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP `,
                {
                    hash_id: notiecData.hash_id,
                    notice_type: notiecData.notice_type,
                    use_yn: 'Y',
                }
            );
            id = notice.insertId;
        }

        const props: any = [
            {
                notice_id: id,
                message: notiecData.message,
                name: notiecData.name,
            },
        ];

        if (!noChageOrigin)
            props.push({
                message: notiecData.message,
                name: notiecData.name,
            });

        await query<SqlInsertUpdate>(
            `INSERT IGNORE INTO notice_detail SET ? ${!noChageOrigin ? 'ON DUPLICATE KEY UPDATE ?' : ''}`,
            ...props
        );

        return id;
    }, true);

export const deleteNoticeChannel = async (notice_id: NoticeId, channel_id: string) =>
    updateNoticeChannelState(notice_id, channel_id, 'N');

export const updateNoticeChannelState = async (notice_id: NoticeId, channel_id: string, use_yn: 'N' | 'Y') =>
    query(
        `UPDATE discord.notice_channel SET use_yn=?, update_at=CURRENT_TIMESTAMP WHERE channel_id=? AND notice_id= ?`,
        use_yn,
        channel_id,
        notice_id
    );

export const selectNoticeDetailEditByModel = async (notice_id: NoticeId) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT 
    CONCAT('알림 멘트 수정') as title
    , JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'message', 'label', '멘트', 'value', message, 'min_length', 1, 'max_length', 1000, 'style', 2, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '표기이름', 'value', IFNULL(name, ''), 'min_length', 0, 'max_length', 50, 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM notice_detail nd 
WHERE notice_id = ?
        `,
        ParseInt(notice_id)
    ).then(res => res[0]);

export const selectGetOAuth = async (guildId: string, typeId?: string | number) =>
    query<{
        guild_id: string;
        type: number;
        tag: string;
        tag_kr: string;
        role_id: string;
        embed_id: number;
        use_yn: 'Y' | 'N';
        create_at: string;
        update_at: string;
    }>(
        `
SELECT
    ab.guild_id
    , ab.\`type\`
    , at2.tag
    , at2.tag_kr
    , ab.role_id
    , ab.embed_id
    , ab.use_yn
    , ab.create_at
    , ab.update_at
	, IFNULL(vnc.use_yn, 'N') AS use_yn 
FROM auth_bord ab
LEFT JOIN auth_type at2 ON ab.\`type\` = at2.auth_type 
LEFT JOIN v_notice_channel vnc ON vnc.notice_id = ab.\`type\` AND vnc.guild_id = ab.guild_id 
WHERE ab.guild_id  = ?
${calTo('AND ab.type = ?', typeId)}
AND ab.use_yn = 'Y'
        `,
        guildId
    );

//////////////////////////////////////////////////////////////////////////
// 출석 체크를 하는 모듈
export const upsertAttach = (noticeId: string | number, authId: string) =>
    getConnection(async query => {
        const isSuccess = await query<SqlInsertUpdate>(
            `
INSERT ignore INTO discord.attendance (\`type\`, yymm, auth_id, event_id)
SELECT 
    notice_id AS \`type\`
    , DATE_FORMAT( now(), '%y%m') AS yymm
    , ? AS auth_id
    , id AS event_id
FROM (
    SELECT notice_id, id, create_at, end_at 
    FROM notice_live nl 
    WHERE nl.notice_id  = ?
    ORDER BY id desc
    LIMIT 1
) eo
WHERE eo.end_at IS NULL`,
            authId,
            noticeId
        ).then(row => row.insertId || row.affectedRows);

        const list = await query<{
            attendance_time: string;
            create_at: string;
        }>(
            `
SELECT 
    nl.create_at AS create_at
    , a.attendance_time 
FROM ( SELECT DATE_FORMAT( now(), '%y%m') AS yymm ) A
LEFT JOIN notice_live nl 
    ON DATE_FORMAT(nl.create_at , '%y%m') = A.yymm 
LEFT JOIN attendance a 
    ON a.yymm = A.yymm 
    AND nl.id = a.event_id 
    AND a.auth_id = ?
WHERE notice_id = ?
        `,
            authId,
            noticeId
        );

        return { isSuccess, list };
    }, true);

/**
 * 3개월 동안 해당 방송의 출석을 조회합니다.
 * @param authId
 * @param noticeId
 * @returns
 */
export const selectAttch3Month = (authId: string, noticeId: string | number) =>
    query(
        `
SELECT 
	a.\`type\`, a.yymm, a.attendance_time, a.auth_id, a.event_id 
	, nl.notice_id 
	, count(1) AS total
FROM (
	SELECT 
		DATE_FORMAT( now(), '%y%m') AS toMonth
		, DATE_FORMAT( now(), '%y%m') -1 AS lastMonth
		, DATE_FORMAT( now(), '%y%m') -2 AS monthBeforLast
	FROM dual
) A
LEFT JOIN attendance a 
	ON a.yymm IN ( A.toMonth, A.lastMonth, A.monthBeforLast )
LEFT JOIN notice_live nl 
	ON nl.id = a.event_id AND nl.notice_id = a.type
WHERE a.\`type\` = ?
AND a.auth_id = ?
GROUP BY nl.notice_id 
ORDER BY total DESC
    `,
        noticeId,
        authId
    );
