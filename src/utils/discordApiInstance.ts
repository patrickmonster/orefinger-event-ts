'use strict';
import { REST } from '@discordjs/rest';
import { RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';
import { createApiInstance } from './apiInstance';

const rest = new REST({ version: '10' }).setToken(`${process.env.DISCORD_TOKEN}`);

rest.on('rateLimited', rateLimitInfo => {
    console.log(`Rate limited for ${rateLimitInfo.sublimitTimeout}ms`);
});

rest.on('invalidRequestWarning', invalidRequestInfo => {
    console.log(`Invalid request warning: ${invalidRequestInfo.count} ${invalidRequestInfo.remainingTime}`);
});

export default rest;
export const openApi = createApiInstance(
    {
        baseURL: 'https://discord.com/api/', // discordTk
    },
    { retry429: true }
);

export const getToken = async (refresh_token: string) =>
    openApi.post(
        'oauth2/token',
        {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

export const changeNickname = async (guild_id: string, user_id: string, nick: string) =>
    rest.patch(`/guilds/${guild_id}/members/${user_id}`, {
        body: { nick },
    });

export const sendWebhook = async (webhook_id: string, token: string, message: RESTPostAPIWebhookWithTokenJSONBody) =>
    openApi.post(`webhooks/${webhook_id}/${token}`, message);
