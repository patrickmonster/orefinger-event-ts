'use strict';
import { query, queryPaging } from 'utils/database';
import { Subscription } from 'interfaces/twitch';

export const register = async (subscription: Subscription) => {
    const { id, type, condition } = subscription;
    query(
        `INSERT INTO event_id (\`type\`, user_id, token, use_yn) VALUES(func_get_type(?, 3), ?, ?, 'Y') on duplicate key update update_at = CURRENT_TIMESTAMP, use_yn = 'Y', token = ?`,
        type,
        condition.broadcaster_user_id || condition.user_id || condition.client_id,
        id,
        id
    ).catch(e => {});
};
