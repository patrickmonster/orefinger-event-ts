import { selectComponentDtilByEmbed, upsertComponent } from 'controllers/component';
import { selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string) => {
    await upsertEmbedUser(
        {
            ...values,
            use_yn: 'Y',
        },
        target
    );
    const result = await selectEmbedUserDtilByEmbed(target);
    if (!result) return await interaction.edit({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });

    const { embed, content } = result;

    interaction.reply({
        ephemeral: true,
        content: '변경되었습니다!',
        embeds: [embed],
    }); // 수정사항 업데이트
};
