import { ApplicationCommandType, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import { channel } from 'controllers/event';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.Message;

export const exec = (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 메세지 커맨드만
    const { message, guild_id } = interaction;
    if (!message || !message.webhook_id) return; // 메세지 인터렉션만
    const { channel_id, webhook_id } = message;

    channel(channel_id, webhook_id).then(data => {
        console.log(data);
    });
};

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
