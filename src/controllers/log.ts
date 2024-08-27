import getConnection, { SqlInsertUpdate, calTo, query } from 'utils/database';
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
        ids: string[];
    }>(`
SELECT JSON_ARRAYAGG(server_id) AS ids FROM task2
WHERE update_at > now() - INTERVAL 5 MINUTE
ORDER BY create_at
    `).then(([res]) => res);

export const liveState = async () =>
    getConnection(async query => {
        const { time, c } = await query<{ time: number; c: number }>(`
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
        const notices = await query<{
            cnt: number;
            tag: string;
        }>(`
SELECT 
	count(1) AS cnt
	, nt.tag 
FROM (
	SELECT *
	FROM notice_channel nc 
	WHERE nc.use_yn = 'Y'
	GROUP BY notice_id 
) nc
INNER JOIN notice n USING(notice_id)
INNER JOIN notice_type nt ON nt.notice_type_id = n.notice_type
GROUP BY notice_type 
        `);

        return { time, c, notices };
    });

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
