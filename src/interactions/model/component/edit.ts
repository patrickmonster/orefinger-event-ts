import { getComponentDtilByEmbed, upsertComponent } from 'controllers/component';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string) => {
    await upsertComponent(values, target);
    const data = await getComponentDtilByEmbed(target);
    if (!data) return await interaction.edit({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });

    const { embed } = data;
    interaction.reply({
        ephemeral: true,
        content: '변경되었습니다!',
        embeds: [embed],
    }); // 수정사항 업데이트
};
