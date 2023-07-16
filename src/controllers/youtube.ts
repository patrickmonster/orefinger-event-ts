'use strict';
import getConnection, { query, queryPaging } from 'utils/database';
import { AuthUser } from 'interfaces/auth';

import { EventSub, Event, Subscription } from 'interfaces/eventsub';

export const createYutubeChannel = (user_id: string, user_name: string, channel_id: string, description: string) =>
    query(
        `
INSERT INTO discord.event_channel
(\`type\`, user_id, name, channel_id, custom_ment, delete_yn)
VALUES(120, ?, 'N')
on duplicate key update delete_yn = 'N'
`,
        [user_id, user_name, channel_id, description]
    );

export const createYutubeUser = (youtube_id: string, user_id: string, login: string, name: string) =>
    query(
        `
select func_auth_token(
    'youtube',
    '',
    ?,
    null,
    null,
    'YOUTUBE'
) as a
        `,
        [
            youtube_id,
            user_id, // auth_id
            login,
            name,
        ]
    );

export const createYutubeEvent = (youtube_id: string, data: string) =>
    query(
        `
INSERT INTO event_id(\`type\`, user_id, \`data\`)
VALUES(120, ?, ?)
on duplicate key update \`data\` = ?
    `,
        youtube_id,
        data,
        data
    );

interface YoutubeVideo {
    id: string;
    title: string;
    video_id: string;
    channel_id: string;
}

export const insertYoutubeVideo = (list: YoutubeVideo[]) =>
    getConnection(async QUERY => {
        list.forEach(({ video_id, channel_id, title }) => {
            QUERY(`INSERT ignore INTO discord.event_video (video_id, channel_id, title) VALUES(?)`, [video_id, channel_id, title]);
        });
    });
