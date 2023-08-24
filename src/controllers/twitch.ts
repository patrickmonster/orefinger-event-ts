'use strict';
import getConnection, { query, queryPaging, sqlInsertUpdate, SqlInsertUpdate } from 'utils/database';
// import { Subscription } from 'interfaces/twitch';
import { Event, Subscription } from 'interfaces/eventsub';

export const register = async (subscription: Subscription) => {
    const { id, type, condition } = subscription;
    query<SqlInsertUpdate>(
        `INSERT INTO event_id (\`type\`, user_id, token, use_yn) VALUES(func_get_type(?, 3), ?, ?, 'Y') on duplicate key update update_at = CURRENT_TIMESTAMP, use_yn = 'Y', token = ?`,
        type,
        condition.broadcaster_user_id || condition.user_id || condition.client_id,
        id,
        id
    ).catch(e => {});
};

export const event = (event: Event, subscription: Subscription) => {
    const { client_id, user_id, broadcaster_user_id } = subscription.condition;
    query(` select func_event(?) as type_idx `, [
        subscription.type, ///
        broadcaster_user_id || user_id || client_id, //
        subscription.id, //
        JSON.stringify(event), //
    ]).catch(e => {
        console.error(e);
    });
};

export const grant = async (user_id: string) =>
    query<{
        channel_id: string;
        login: string;
        name: string;
    }>(
        `
SELECT ec.channel_id
    , at2.login
    , at2.name
FROM discord.event_channel ec
inner join auth_token at2 using(user_id) 
where user_id = ?
and ec.type = 14
and delete_yn = 'N'
    `,
        user_id
    );

type revokeType = {
    channel_id: string;
    login: string;
    name: string;
};
export const revoke = async (user_id: string) =>
    getConnection<revokeType[]>(async QUERY => {
        QUERY<SqlInsertUpdate>(`UPDATE auth_token SET is_session='N', update_at=CURRENT_TIMESTAMP WHERE user_id=? AND \`type\`=2`, user_id);
        //
        return QUERY<revokeType>(
            `
SELECT ec.channel_id
    , at2.login
    , at2.name
FROM event_channel ec
inner join auth_token at2 using(user_id) 
where user_id = ?
and ec.type = 14
and delete_yn = 'N'
            `,
            user_id + '' // 인덱스
        );
    });

export type eventChannelType = {
    user_id?: string;
    name?: string;
    custom_ment?: string;
    hook_id?: string;
    hook_token?: string;
    delete_yn?: string;
};

export const stateChangeEventChannel = async (channel_id: string, props: eventChannelType) =>
    query(`UPDATE discord.event_channel SET update_at=CURRENT_TIMESTAMP, ? WHERE channel_id=? `, props, channel_id);

export const streamOnline = async ({ id, broadcaster_user_id, started_at }: Event, type = 14) =>
    query<{
        id: string;
        name: string;
        login: string;
        kr_name: string;
        channel_id: string;
        custom_ment: string;
        url: string;
        title: string;
        game_id: string;
        game_name: string;
    }>(
        `
select
    id
    , name
    , login
    , kr_name
    , channel_id, IF(custom_ment > '', custom_ment,  CONCAT('@everyone\n', if(kr_name > '', kr_name, name) ,'님께서 라이브 방송을 시작하였습니다!')) as custom_ment
    , url
    , vls.title
    , vls.game_id
    , vls.game_name
from (
    select func_onoff_event(?) AS event_id
        , ? AS user_id
    from dual
) live
left join v_notification_channel vnc on live.event_id <> '0' and vnc.id = live.user_id
left join v_live_state vls on vnc.id = vls.auth_id
where vls.type in (16) -- 제목 상태 변경 이벤트
group by channel_id
    `,
        [`${broadcaster_user_id}`, id, type, started_at],
        broadcaster_user_id + ''
    );

export const streamOffline = async (broadcaster_user_id: string, type = 14) =>
    query<{
        event_id: string;
    }>(`select func_onoff_event(?) AS event_id`, [broadcaster_user_id, null, type, new Date()]);

export type Attendance = {
    attendance_time: string;
    create_at: string;
};

export const removeChannel = async (channel_id: string) =>
    query<SqlInsertUpdate>(`UPDATE event_channel SET delete_yn = 'Y' WHERE channel_id = ?`, channel_id).catch(e => {});

// 라이브 출석체크
export const attendance = async (broadcaster_user_id: string, user_id: string) =>
    getConnection<{
        is_success: number;
        list: Attendance[];
    }>(async QUERY => {
        const is_success = await QUERY<SqlInsertUpdate>(
            `
INSERT ignore INTO discord.attendance (\`type\`, yymm, auth_id, event_id)
select \`type\`
    , DATE_FORMAT( now(), '%y%m')
    , ? as auth_id
    , event_id
from (
    SELECT *
    FROM discord.event_live
    where auth_id = ?
    and event_id is not null
) eo`,
            broadcaster_user_id,
            user_id
        ).then(row => row.insertId || row.affectedRows);

        const list = await QUERY<Attendance>(
            `
select attendance_time, create_at 
from (
        select *
        from event_online
        where auth_id = ?
        and \`type\` = 14
        and DATE_FORMAT( create_at , '%y%m') = DATE_FORMAT( now(), '%y%m')
) eo
left join (
        select *
        from attendance a
        where a.type = 14
        and yymm = DATE_FORMAT( now(), '%y%m')
        and a.auth_id = ?
) a using(event_id, \`type\`)
        `,
            user_id,
            broadcaster_user_id
        );

        return { is_success, list };
    });

export const attendanceList = async (page: number, broadcaster_user_id: string, id: string) =>
    queryPaging<{
        total: number;
        cnt: number;
        yymm: string;
        late_time: string;
        per: number;
    }>(
        `
select
    total
    , cnt
    , concat(left(yymm, 2), '년', right(yymm, 2), '월') as yymm
    , TIME_FORMAT(SEC_TO_TIME(abs(avg_late_time)), '%H시간%i분%s초' ) as late_time
    , per
from attendance_rank 
where auth_id = ?
and stream_id = ?
        `,
        page,
        id,
        broadcaster_user_id
    );
