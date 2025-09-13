import {
    RESTPostAPIChannelMessageJSONBody,
    RESTPostAPIChannelMessageResult,
    RESTPostAPIWebhookWithTokenJSONBody,
} from 'discord-api-types/v10';
import { CreateMessage } from 'controllers/log';
import discord, { openApi } from 'utils/discordApiInstance';
import { postDiscord } from './api';

export const createMessage = async (channel_id: string, body: RESTPostAPIChannelMessageJSONBody) =>
    await postDiscordMessage(`/channels/${channel_id}/messages`, body);

export const createWebhookMessage = async (hook_id: string, token: string, body: RESTPostAPIWebhookWithTokenJSONBody) =>
    await postDiscordMessage(`/${hook_id}/${token}`, body);

export const postDiscordMessage = async (url: `/${string}`, body: RESTPostAPIChannelMessageJSONBody) =>
    await postDiscord<RESTPostAPIChannelMessageResult>(url, { body }).then(async res => {
        CreateMessage({
            channel_id: res.channel_id,
            message_id: res.id,
            message: JSON.stringify(body),
        }).catch(() => {});
        return res;
    });

export const deleteMessage = async (channelId: string, messageId: string) =>
    discord.delete(`/channels/${channelId}/messages/${messageId}`);

export const editMessage = async (channelId: string, messageId: string, body: RESTPostAPIChannelMessageJSONBody) =>
    discord.patch(`/channels/${channelId}/messages/${messageId}`, { body });

export const editWebhookMessage = async (url: string, messageId: string, body: RESTPostAPIWebhookWithTokenJSONBody) =>
    openApi.patch(`/${url}/messages/${messageId}`, body);
