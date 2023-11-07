import { MessageInteraction } from 'interactions/message';

import authTokenSelect from 'components/authTokenSelect';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, [command]: string[]) => {
    const { user, guild_id } = interaction;

    const reply = await interaction.differ({
        ephemeral: true,
    });

    authTokenSelect(user?.id || '0', `select online ${command || 0}`, 2).then(async user => {
        if (Array.isArray(user)) {
            interaction.reply({
                components: user,
            });
        } else {
            console.log('user', user);
        }
    });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
