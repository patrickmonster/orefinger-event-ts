'use strict';
import getConnection, { query, selectPaging, SqlInsertUpdate } from 'utils/database';
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

export type eventChannelType = {
    user_id?: string;
    name?: string;
    custom_ment?: string;
    hook_id?: string;
    hook_token?: string;
    delete_yn?: string;
};

export type Attendance = {
    attendance_time: string;
    create_at: string;
};

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
    selectPaging<{
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
