import { Paging } from 'interfaces/swagger';
import { calLikeTo, calTo, query, selectPaging, tastTo } from 'utils/database';

export type NoticeId = number | string;

export const selectType = async () => query(`SELECT notice_type_id, tag, use_yn, video_yn  FROM notice_type nt`);

export const liveList = () =>
    query(
        `
SELECT 
    el.auth_id, el.event_id, el.type, DATE_ADD(el.create_at, INTERVAL 9 HOUR) as create_at
    , t.value AS live_type
    , t.tag
    , at2.login, at2.name, at2.user_type
    , ls.title, ls.game_id, ls.game_name
    , (SELECT count(0) FROM attendance a WHERE a.yymm = DATE_FORMAT( NOW(), '%y%m') AND el.event_id = a.event_id AND el.type = a.type) AS attendance
FROM (
    SELECT el.*
    FROM event_live el 
    WHERE 1=1
    AND el.type = 14
    AND event_id IS NOT NULL 
    ORDER BY el.create_at DESC
    LIMIT 30
) el
LEFT JOIN types t ON t.idx = el.type
LEFT JOIN auth_token at2 ON at2.type =2 AND at2.user_id = el.auth_id
LEFT JOIN v_live_state ls ON ls.auth_id = el.auth_id
WHERE 1=1
AND el.event_id IS NOT NULL 
AND at2.user_id IS NOT NULL
-- AND at2.is_session ='Y'
    
    `
    );

export const selectUserEvents = (user_id: string, events: string[]) =>
    query(
        `
SELECT ei.type, ei.user_id, ei.token, ei.data, ei.use_yn, t.value 
, vat.*
from v_auth_token vat
left join discord.event_id ei on ei.user_id = vat.user_id 
inner join types t on t.idx = ei.type
where 1=1
and auth_id = ?
and vat.type = 2
and t.key = 3 
${tastTo("AND use_yn = 'Y'")}
and t.value in (?)
order by t.idx
`,
        user_id,
        events
    );

export const total = () =>
    query(`
select 
( select count(0) as cnt from auth_token at2  where at2.type = 2 and is_session = 'Y' group by at2.type ) as S
, ( select count(0) as cnt from auth_token at2  where at2.type = 3 group by at2.type ) as T
, code_2 as totalGuld
, code_3 as totalUser
from state s
where idx = 1
    `);

export const stream = async () =>
    query<{
        user_id: string;
    }>(`
select user_id 
from auth_token at2
WHERE at2.type in (2,3)
and user_type = 37
GROUP by user_id 
    `);

export const getAttendanceAtLive = async (liveId: string | number) =>
    query<{
        type: number;
        yymm: number;
        attendance_time: string;
        auth_id: string;
        id: string;
        name: string | null;
        auth_yn: 'Y' | 'N';
        total: number;
    }>(
        `
SELECT 
    A.type
    , A.yymm
    , A.auth_id
    , IF ( vat.name > '', vat.name, b.name) AS name
    , IF ( vat.name > '', 'Y', 'N') AS auth_yn
    , vat.avatar
    , AVG(A.attendance_time) AS attendance_time
    , SUM(1) AS total 
FROM (
	SELECT 
	    a.type
	    , a.yymm
	    , TIMESTAMPDIFF(SECOND, nl.create_at, a.attendance_time) AS attendance_time
	    , a.auth_id
	    , nl.id
	    , nt.auth_type 
	FROM notice n 
	INNER JOIN notice_type nt ON nt.notice_type_id = n.notice_type
	INNER JOIN notice_live nl ON n.notice_id = nl.notice_id 
	INNER JOIN attendance a ON a.type = n.notice_id AND nl.id = a.event_id AND yymm = DATE_FORMAT( now(), '%y%m') 
	WHERE n.notice_id = ?
) A
LEFT JOIN v_auth_token vat ON A.auth_type = vat.\`type\` AND A.auth_id = vat.auth_id 
LEFT JOIN auth b ON A.auth_id = b.auth_id
GROUP BY a.auth_id
ORDER BY total DESC, attendance_time
LIMIT 30

    `,
        liveId
    );

export const selectNoticeLiveOnList = async (type?: number) =>
    query<{
        notice_id: number;
        id: string;
        create_at: string;
        end_at: string;
        notice_type_tag: string;
        name: string;
    }>(
        `
SELECT nl.notice_id, nl.id, nl.create_at, nl.end_at 
    , vn.notice_type
	, vn.notice_type_tag
	, vn.name
    , nl.image
    , nl.title 
    , nl.game 
FROM notice_live nl
LEFT JOIN v_notice vn ON nl.notice_id = vn.notice_id 
WHERE nl.end_at IS NULL 
${calTo('AND vn.notice_type = ?', type)}
ORDER BY nl.create_at DESC
LIMIT 30
    `
    );

export const selectNotice = async (
    page: Paging,
    { type, hash, noticeId }: { type?: number; hash?: string; noticeId?: string }
) =>
    selectPaging<{
        notice_id: number;
        hash_id: string;
        notice_type: number;
        notice_type_tag: string;
        video_yn: 'Y' | 'N';
        message: string;
        name: string;
        img_idx: number;
        create_at: string;
        update_at: string;
    }>(
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
    , create_at
    , update_at
FROM v_notice vn
WHERE 1=1
${calTo('AND vn.notice_type = ?', type)}
${calTo('AND vn.notice_id = ?', noticeId)}
${calLikeTo('AND vn.hash_id like ?', hash)}
        `,
        page
    );

export const selectNoticeHistoryById = async (page: Paging, noticeId: NoticeId) =>
    selectPaging<{
        notice_id: number;
        channel_id: string;
        notice_type: number;
        key_id: string;
        tags: string[] | null;
        channel: {
            channelId: string;
            channelName: string;
            channelImageUrl: string;
        };
        title: `"${string}"` | null; // 아프리카일 경우 null 이 나올 수 있음(오프라인)
        json_data: object;
        create_at: string;
    }>(
        `
SELECT
	notice_id
	, channel_id
	, notice_type
	, key_id
	, tags
	, channel
	, title
	, json_data
	, create_at 
FROM v_notice_history
WHERE 1=1
AND notice_id = ?
        `,
        page,
        noticeId
    );

export const selectNoticeHistoryDtailById = async (page: Paging, noticeId: NoticeId) =>
    selectPaging<{
        notice_id: number;
        channel_id: string;
        notice_type: number;
        key_id: string;
        cnt: string;
        json_data: object;
        create_at: string;
    }>(
        `
SELECT
	notice_id
	, channel_id
	, notice_type
	, key_id
	, cnt
	, json_data
	, create_at
FROM v_notice_history_detail
WHERE 1=1
AND notice_id = ?
            `,
        page,
        noticeId
    );
