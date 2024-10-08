import { selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 데시보드 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, target: string) => {
    const { user, member } = interaction;
    const user_id = user?.id || member?.user.id;
    await upsertEmbedUser(
        {
            ...values,
            use_yn: 'Y',
            update_user: user_id,
        },
        target
    );
    const result = await selectEmbedUserDtilByEmbed(target);
    if (!result) return await interaction.edit({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });

    const { embed } = result;

    interaction.reply({
        ephemeral: true,
        content: '변경되었습니다! - (새로고침 버튼을 눌러, 변경사항을 확인해주세요!)',
        embeds: [embed],
    });
};
