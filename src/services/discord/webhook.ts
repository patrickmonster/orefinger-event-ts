import {
    RESTGetAPIChannelWebhooksResult,
    RESTPostAPIChannelWebhookResult,
} from 'discord-api-types/v10';
import { upsertWebhook } from 'controllers/guild/webhook';
import { getDiscord, postDiscord } from './api';

export const getWebhooks = async (channel_id: string) =>
    await getDiscord<RESTGetAPIChannelWebhooksResult>(`/channels/${channel_id}/webhooks`);

export const createWebhook = async (
    channel_id: string,
    data: { name: string; avatar?: string; auth_id?: string },
    use_yn: 'Y' | 'N' = 'N'
) =>
    await postDiscord<RESTPostAPIChannelWebhookResult>(`/channels/${channel_id}/webhooks`, { body: data }).then(res => {
        upsertWebhook(channel_id, {
            name: data.name || undefined,
            webhook_id: res.id,
            token: res.token,
            auth_id: data.auth_id,
            use_yn,
        }).catch(() => {});

        return res;
    });
