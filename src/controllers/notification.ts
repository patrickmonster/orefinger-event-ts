import { Paging } from 'interfaces/swagger';
import { calLikeTo, calTo, query, selectPaging } from 'utils/database';

export type NoticeId = number | string;

export const selectType = async () => query(`SELECT notice_type_id, tag, use_yn, video_yn  FROM notice_type nt`);

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

export const getAttendanceAtLive = async (liveId: string | number, range: number = 1) =>
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
    , A.auth_id
    , IF(vat.name IS NOT NULL AND vat.name <> '', vat.name, b.name) AS name
    , IF(vat.name IS NOT NULL AND vat.name <> '', 'Y', 'N') AS auth_yn
    , vat.avatar
    , A.attendance_time
    , A.total
FROM (
    SELECT
        n.notice_id                                                   AS type
        , a.auth_id
        , nt.auth_type
        , AVG(TIMESTAMPDIFF(SECOND, nl.create_at, a.attendance_time)) AS attendance_time
        , COUNT(*)                                                    AS total
    FROM notice n
    INNER JOIN notice_type  nt ON nt.notice_type_id = n.notice_type
    INNER JOIN notice_live  nl ON nl.notice_id      = n.notice_id
    INNER JOIN attendance   a  ON a.type      = n.notice_id
                              AND a.event_id  = nl.id
    WHERE n.notice_id = ?
      AND a.attendance_time >= NOW() - INTERVAL ? MONTH
      AND a.attendance_time <  NOW()
    GROUP BY a.auth_id, nt.auth_type, n.notice_id
) A
LEFT JOIN v_auth_token vat ON vat.type = A.auth_type AND vat.auth_id = A.auth_id
LEFT JOIN auth         b   ON b.auth_id = A.auth_id
ORDER BY A.total DESC, A.attendance_time
LIMIT 30

    `,
        liveId,
        range
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
SELECT nl.notice_id, nl.id
    , DATE_ADD(nl.create_at, INTERVAL 9 HOUR) as create_at
    , nl.end_at 
    , vng.notice_type
	, vng.notice_type_tag
	, vng.name
    , nl.image
    , nl.title 
    , nl.game
    , (
    	CASE 
			WHEN vng.notice_type = 5 THEN CONCAT('https://stimg.sooplive.com/LOGO/', LEFT(vng.hash_id, 2) , '/', vng.hash_id,'/m/', vng.hash_id ,'.webp')
			WHEN vng.notice_type = 4 THEN 'https://orefinger.click/assets/chzzk.796d75f9.png'
    	END
    ) as profile_img 
    , (
    	CASE 
    		WHEN vng.notice_type = 5 THEN CONCAT('https://play.sooplive.com/', vng.hash_id,'/1' )
    		wHEN vng.notice_type = 4 THEN CONCAT('https://chzzk.naver.com/live/', vng.hash_id)
    	END
    ) as live_link 
FROM notice_live nl
LEFT JOIN v_notice_guild vng  ON nl.notice_id = vng.notice_id 
WHERE nl.end_at IS NULL 
${calTo('AND vng.notice_type = ?', type)}
group by vng.notice_id
ORDER BY nl.create_at DESC
LIMIT 50
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
