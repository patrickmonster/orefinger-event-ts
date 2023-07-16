import { query, queryPaging } from 'utils/database';

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
