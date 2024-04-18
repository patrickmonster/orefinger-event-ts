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

export const ecsPing = async (id: string) =>
    query<SqlInsertUpdate>(`UPDATE task SET last_ping=CURRENT_TIMESTAMP WHERE idx=?`, {
        id,
    });

export const ecsSelect = async (revision: string) =>
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
WHERE revision = ?
        `,
        ParseInt(revision)
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
