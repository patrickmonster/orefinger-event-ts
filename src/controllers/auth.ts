'use strict';
import { query, queryPaging } from 'utils/database';
import { AuthUser } from 'interfaces/auth';

import { EventSub, Event, Subscription } from 'interfaces/eventsub';

export const discord = async (profile: AuthUser, refreshToken: string) => auth('discord', profile.id, profile, refreshToken);

export const auth = async (type: string, auth_id: string, profile: AuthUser, refreshToken: string) => {
    const { id, username, discriminator, email, avatar } = profile;
    return query(`select func_auth_token(?) as user_type`, [type, '', id, auth_id, username, discriminator, email, avatar, refreshToken]);
};

export const userUpdate = async (event: Event) => {
    const { user_id, user_login, user_name, email } = event;
    await query(
        `
UPDATE auth_token SET 
?, update_at = CURRENT_TIMESTAMP 
WHERE \`type\` in (2,3) and user_id=?
        `,
        { login: user_login, name: user_name, email },
        user_id + ''
    );
};
