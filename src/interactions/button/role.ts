import { basename } from 'path';

import authTokenSelect from 'components/authTokenSelect';
import authTusuSelect from 'components/authTusuSelect';
import { MessageInteraction } from 'interactions/message';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, [command]: string[]) => {
    const { user, guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    await authTokenSelect(user?.id || '0', `select role ${command || 0}`, 2).then(async user => {
        if (Array.isArray(user)) {
            interaction.reply({
                components: user,
            });
        } else {
            console.log('user', user);
            await authTusuSelect(interaction, guild_id || '', user.auth_id || '0', user.user_id, command || '0');
        }
    });
};

export default {
    alias: [name, 'rule'],
};
