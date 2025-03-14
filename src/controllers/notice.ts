import {
    APIEmbed,
    APIModalInteractionResponseCallbackData,
    APISelectMenuDefaultValue,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import { NoticeDetail } from 'interfaces/notice';
import getConnection, { SqlInsertUpdate, calTo, format, query } from 'utils/database';
import { ParseInt } from 'utils/object';

export type NoticeId = number | string;

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
        'description', nd.message
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
INNER JOIN notice_guild nd using(notice_id)
WHERE 1=1
AND notice_id = ?
    
    `,
        guild_id,
        ParseInt(notice_id)
    ).then(res => res[0]);

/**
 * 사용자의 등록한 알림 리스트를 불러옵니다.
 * @param auth_id
 * @returns
 */
export const selectNoticeRegisterChannels = async (auth_id: string) =>
    query<{
        channel_id: string;
        notice_id: string;
        guild_id: string;
        create_at: string;
        update_at: string;
        create_user_id: string;
        name: string;
    }>(
        `
SELECT nc.channel_id
	, nc.notice_id
	, nc.guild_id
	, nc.create_at
	, nc.update_at
	, nc.use_yn
	, nc.create_user_id
	, nd.name
FROM notice_channel nc
LEFT JOIN notice_guild nd USING(notice_id, guild_id)
WHERE nc.create_user_id = ?
AND nc.use_yn = 'Y'
        `,
        auth_id
    );

export const deleteOrInsertNoticeChannels = async (
    notice_id: NoticeId,
    guild_id: string,
    channel_ids: string[],
    auth_id: string
) =>
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
INSERT INTO notice_channel (notice_id, guild_id, channel_id, use_yn, create_user_id)
VALUES ${channel_ids.map(channel_id => format('(?)', [[notice_id, guild_id, channel_id, 'Y', auth_id]])).join(',')}
ON DUPLICATE KEY UPDATE use_yn = 'Y', update_at=CURRENT_TIMESTAMP
            `
            );
    }, true);

export const upsertNotice = async (guildId: string, notiecData: Partial<NoticeDetail>, noChageOrigin?: boolean) =>
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
                guild_id: guildId,
                message: notiecData.message,
                name: notiecData.name,
            },
        ];

        if (!noChageOrigin)
            props.push({
                message: notiecData.message,
                name: notiecData.name,
                update_user_id: notiecData.update_user_id,
            });

        await query<SqlInsertUpdate>(
            `INSERT IGNORE INTO  notice_guild SET ? ${!noChageOrigin ? 'ON DUPLICATE KEY UPDATE ?' : ''}`,
            ...props
        );

        return id;
    }, true);

export const deleteNotice = async (notice_id: NoticeId) =>
    query(`UPDATE notice SET use_yn = 'N', update_at=CURRENT_TIMESTAMP WHERE notice_id = ?`, ParseInt(notice_id));

export const deleteNoticeChannel = async (notice_id: NoticeId, channel_id: string) =>
    updateNoticeChannelState(notice_id, channel_id, 'N');

export const updateNoticeChannelState = async (notice_id: NoticeId, channel_id: string, use_yn: 'N' | 'Y') =>
    query(
        `UPDATE discord.notice_channel SET use_yn=?, update_at=CURRENT_TIMESTAMP WHERE channel_id=? AND notice_id= ?`,
        use_yn,
        channel_id,
        notice_id
    );

export const selectNoticeDetailEditByModel = async (notice_id: NoticeId, guildId: string) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT 
    CONCAT('알림 멘트 수정') as title
    , JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'message', 'label', '멘트', 'value', message, 'min_length', 0, 'max_length', 1000, 'style', 2, 'required', false )
            )
        )
    ) AS components
FROM notice_guild nd 
WHERE notice_id = ?
AND guild_id = ?
        `,
        ParseInt(notice_id),
        guildId
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
    ORDER BY create_at DESC
    LIMIT 1
) eo
WHERE eo.end_at IS NULL`,
            authId,
            noticeId
        ).then(row => row.insertId || row.affectedRows);

        const list = await query<{
            attendance_time: string;
            create_at: string;
            name: string;
        }>(
            `
SELECT 
    nl.create_at AS create_at
    , a.attendance_time 
    , b.name 
FROM ( SELECT DATE_FORMAT( now(), '%y%m') AS yymm ) A
LEFT JOIN notice_live nl 
    -- ON DATE_FORMAT(nl.create_at , '%y%m') = A.yymm 
	ON nl.create_at > DATE_ADD(NOW(), INTERVAL -1 MONTH)
LEFT JOIN attendance a 
    ON a.yymm = A.yymm 
    AND nl.id = a.event_id 
    AND a.auth_id = ?
LEFT JOIN auth b ON b.auth_id = a.auth_id  
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

export const selectNoticeByPk = async (noticeId: NoticeId) =>
    query<
        NoticeDetail & {
            video_yn: 'Y' | 'N';
            notice_type_tag: string;
            img_idx: number;
            live: number;
            create_at: string;
            update_at: string;
        }
    >(
        `
SELECT
    notice_id
    , hash_id
    , notice_type
    , notice_type_tag
    , video_yn
    , message
    , name
    , img_idx
    , vn.create_at
    , vn.update_at
    , count( 1 ) AS live
FROM v_notice vn
LEFT JOIN notice_live nl USING(notice_id)
WHERE notice_id = ?
AND nl.create_at > last_day(now() - interval 1 month)
GROUP BY notice_id 
    `,
        ParseInt(noticeId)
    ).then(res => res[0]);

export const selectNoticeByGuild = async (noticeId: string, guildId: string) =>
    query<{
        notice_id: number;
        hash_id: string;
        guild_id: string;
        notice_type: number;
        notice_type_tag: string;
        video_yn: 'Y' | 'N' | boolean;
        embed_id: number;
        img_idx: number;
        message: string;
        name: string;
        update_user_id: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT notice_id
	, hash_id
	, notice_type
	, notice_type_tag
	, video_yn
	, guild_id
	, embed_id
	, img_idx
	, message
	, name
	, update_user_id
	, create_at
	, update_at
FROM v_notice_guild vng 
WHERE 1=1
AND ? = vng.guild_id
AND ? = vng.notice_id
        `,
        guildId,
        ParseInt(noticeId)
    ).then(res => res[0]);

/**
 * 한달치 방송 리스트를 불러옵니다.
 * @param noticeId
 * @returns
 */
export const seelctNoticeHistory = async (noticeId: NoticeId) =>
    query<{
        notice_id: number;
        id: number;
        create_at: string;
        live_at: string;
        end_at: string;
        image: string;
        title: string;
        game: string;
    }>(
        `
SELECT
notice_id
, id
, create_at
, live_at
, end_at
, image
, title
, game
FROM notice_live nl 
WHERE 1=1
AND nl.notice_id = ?
AND create_at > DATE_ADD(NOW(), INTERVAL -1 MONTH)
        `,
        ParseInt(noticeId)
    );
