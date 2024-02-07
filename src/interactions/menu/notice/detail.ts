import { MessageMenuInteraction } from 'interactions/message';

import { getNoticeDetailByEmbed } from 'components/notice';
/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [noticeId],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    const { embed, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

    interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components,
    });
};
