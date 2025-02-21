import { MessageInteraction } from 'fastify-discord';

import { messageDelete } from 'components/discord';

export const exec = async (interaction: MessageInteraction, broadcaster_user_id: string) => {
    const { user, id, channel_id } = interaction;

    await messageDelete(channel_id, id)
        .then(() => {
            interaction.remove();
        })
        .catch(() => {
            interaction.reply({
                content: '삭제에 실패했습니다',
                ephemeral: true,
            });
        });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
