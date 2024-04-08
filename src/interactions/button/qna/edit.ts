import { MessageInteraction } from 'interactions/message';

import { selectEmbedUserBaseEditByModel } from 'controllers/embed';

import { selectEmbed } from 'components/embed/userDtail';
/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, embed_id: string, target: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    switch (target) {
        case 'reload': {
            await selectEmbed(interaction, embed_id);
            break;
        }
        case 'edit': {
            // 모달처리
            interaction.model({
                ...(await selectEmbedUserBaseEditByModel(embed_id)),
                custom_id: `key embed ${embed_id}`,
            });
            break;
        }
    }
};
