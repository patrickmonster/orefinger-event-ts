import {
    ApplicationCommandType,
    RESTGetAPIGuildWebhooksResult,
    RESTPatchAPIApplicationCommandJSONBody,
} from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import discord from 'utils/discordApiInstance';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.User;

export const exec = async (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id, guild_id } = interaction;

    interaction.differ({ ephemeral: true });

    const webhooks = await discord.get<RESTGetAPIGuildWebhooksResult>(`/guilds/${guild_id}/webhooks`);
    console.log(webhooks);
};

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
