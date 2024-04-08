import { messageCreate } from 'components/discord';
import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { MessageMenuInteraction } from 'interactions/message';
import { createButtonArrays, createPrimaryButton, createSuccessButton } from 'utils/discord/component';

/**
 * 알림을 수정합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, embedId: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    const types = Object.keys(values);
    const { embed } = await selectEmbedUserDtilByEmbed(embedId);

    await interaction.differ({ ephemeral: true });

    await messageCreate(channel.id, {
        embeds: embed ? [embed] : embed,
        components: createButtonArrays(
            ...types.map(type =>
                createPrimaryButton(`qna write ${type} `, {
                    label: `${values[type]}`,
                })
            ),
            createSuccessButton('qna help', {
                emoji: { name: '❓' },
            })
        ),
    })
        .then(() => {
            interaction.remove();
            //
        })
        .catch(() =>
            interaction.reply({
                content: '데시보드를 전송하는데에 문제가 발생 하였습니다...! 권한을 확인 해 주세요!',
                ephemeral: true,
            })
        );
};
