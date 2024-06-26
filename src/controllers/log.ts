import { SqlInsertUpdate, calTo, query } from 'utils/database';
import { ParseInt } from 'utils/object';

interface Message {
    message_id: string;
    channel_id: string;
    message: string;
}

export const CreateMessage = async (message: Message) =>
    query<SqlInsertUpdate>(`INSERT INTO message_log set ?`, message);

export const ecsSet = async (id: string, revision: string, family: string) =>
    query<SqlInsertUpdate>(`INSERT INTO task set ? `, {
        id,
        revision: ParseInt(revision),
        family,
    });

export const ecsRevisionList = async (...revisions: number[]) =>
    query<{
        idxs: number[];
        revision: string;
    }>(
        `
SELECT 
	JSON_ARRAYAGG(
	 	idx
	) AS idxs
	, revision
FROM task t
${calTo('WHERE t.revision IN (?)', revisions)}
GROUP BY revision 
    `
    );

export const ecsSelect = async (revision?: string, id?: string) =>
    query<{
        idx: number;
        id: string;
        revision: string;
        family: string;
        last_ping: string;
        create_at: string;
        rownum: number;
    }>(
        `
SELECT
    idx
    , id
    , revision
    , family
    , last_ping
    , create_at 
	, @rownum := @rownum + 1 AS rownum
FROM task t, (SELECT @rownum := 0) r
WHERE 1=1
${calTo('AND t.revision = ?', revision)}
${calTo('AND t.id = ?', id)}
        `
    );

export const ecsTaskState = async (noticeType?: 4 | 5) =>
    query<{
        total: number;
        revision: string;
        ids: string[];
        create_at: string;
    }>(`
SELECT total
	, B.revision
	, B.ids
	, B.create_at
FROM (
	SELECT count(1) AS total
	FROM v_notice vn 
    WHERE 1=1
    ${calTo('AND vn.notice_type = ?', noticeType)} 
) A
LEFT JOIN (
	SELECT 
		revision
		, JSON_ARRAYAGG(id) AS ids 
		, create_at
	FROM task t
	GROUP BY t.revision
	ORDER BY idx DESC
) B ON 1=1
LIMIT 1
    `).then(([res]) => res);

export const liveState = async () =>
    query<{ time: number; c: number }>(`
SELECT avg(t) AS time 
    , COUNT(0) AS c 
FROM (
    SELECT 
        TIMESTAMPDIFF(SECOND, live_at, create_at) AS t
    FROM notice_live nl 
    WHERE 1=1
	AND create_at < DATE_ADD(NOW(), INTERVAL 3 MONTH)
    AND nl.live_at IS NOT NULL
) A
WHERE 1=1
AND t < 1000
    `).then(([res]) => res);

export const liveStateTotal = async () =>
    query<{ time: number; notice_type: number; notice_type_tag: string }>(`
SELECT 
	avg(t) AS time
	, notice_type
	, notice_type_tag
FROM (
	SELECT 
	    TIMESTAMPDIFF(SECOND, live_at, nl.create_at) AS t
	    , vn.notice_type 
	    , vn.notice_type_tag
	FROM v_notice vn
	LEFT JOIN notice_live nl
		ON nl.notice_id = vn.notice_id 
	WHERE 1=1
	AND live_at IS NOT NULL
) A
WHERE 1=1
AND t < 1000
GROUP BY notice_type
    `);
