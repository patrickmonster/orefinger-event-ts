import { query, SqlInsertUpdate } from 'utils/database';

export const liveList = () =>
    query(
        `
SELECT el.auth_id, el.event_id, el.type, el.create_at 
    , t.value as live_type
    , t.tag
    , at2.login, at2.name, at2.user_type
    , ls.title, ls.game_id, ls.game_name 
    , (select count(0) from attendance a where a.yymm = DATE_FORMAT( NOW(), '%y%m') and el.event_id = a.event_id and el.type = a.type) as attendance
FROM event_live el
join types t on t.idx = el.type
left join auth_token at2 on at2.type =2 and at2.user_id = el.auth_id 
left join v_live_state ls on ls.auth_id = el.auth_id
WHERE 1=1
and at2.user_id is not null
and at2.is_session ='Y'
order by el.create_at desc
limit 0, 50
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
