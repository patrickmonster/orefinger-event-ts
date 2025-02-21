import { MessageMenuInteraction } from 'fastify-discord';

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

    const { embeds, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

    interaction.reply({
        embeds,
        ephemeral: true,
        components,
    });
};
