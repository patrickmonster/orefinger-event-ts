'use strict';
import { query, queryPaging } from 'utils/database';
import { AuthUser } from 'interfaces/auth';

export const discord = async (profile: AuthUser, refreshToken: string) => auth('discord', profile.id, profile, refreshToken);

export const auth = async (type: string, auth_id: string, profile: AuthUser, refreshToken: string) => {
    const { id, username, discriminator, email, avatar } = profile;
    return query(`select func_auth_token(?) as user_type`, [type, '', id, auth_id, username, discriminator, email, avatar, refreshToken]);
};
