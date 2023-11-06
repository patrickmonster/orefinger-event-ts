import { selectComponentRowDtilByEmbed, upsertComponentActionRow } from 'controllers/component';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string) => {
    await upsertComponentActionRow(values, target);
    const data = await selectComponentRowDtilByEmbed(target);
    if (!data) return await interaction.edit({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });

    const { embed } = data;
    interaction.reply({
        ephemeral: true,
        content: '변경되었습니다!',
        embeds: [embed],
    }); // 수정사항 업데이트
};
