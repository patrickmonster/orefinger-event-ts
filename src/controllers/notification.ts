import { query, SqlInsertUpdate } from 'utils/database';

export const liveList = () =>
    query(
        `
SELECT el.auth_id, el.event_id, el.type, DATE_ADD(el.create_at, INTERVAL 9 HOUR) as create_at
    , t.value AS live_type
    , t.tag
    , at2.login, at2.name, at2.user_type
    , ls.title, ls.game_id, ls.game_name
    , (SELECT count(0) FROM attendance a WHERE a.yymm = DATE_FORMAT( NOW(), '%y%m') AND el.event_id = a.event_id AND el.type = a.type) AS attendance
FROM event_live el
JOIN types t ON t.idx = el.type
LEFT JOIN auth_token at2 ON at2.type =2 AND at2.user_id = el.auth_id
LEFT JOIN v_live_state ls ON ls.auth_id = el.auth_id
WHERE 1=1
AND el.event_id IS NOT NULL 
AND at2.user_id IS NOT NULL
AND at2.is_session ='Y'
ORDER BY el.create_at DESC
LIMIT 0, 30
    `
    );

export const getUserEvents = (user_id: string, events: string[]) =>
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
and use_yn = 'Y'
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
