import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v10';
import { appInteraction } from 'interactions/app';
import { basename } from 'path';

import authTokenSelect from 'components/authTokenSelect';
import { getUser } from 'components/twitch';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandType.Message;

export const exec = async (interaction: appInteraction) => {
    if (interaction.type !== type) return; // 유저 커맨드만
    const { target_id } = interaction;

    interaction
        .deffer({
            ephemeral: true,
        })
        .then(async replay => {});
};

const api: RESTPatchAPIApplicationCommandJSONBody = {
    name,
    type,
    dm_permission: false,
};

// 인터렉션 이벤트
export default api;
