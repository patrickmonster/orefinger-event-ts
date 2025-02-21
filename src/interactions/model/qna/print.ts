import { messageCreate } from 'components/discord';
import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { MessageMenuInteraction } from 'fastify-discord';
import { createButtonArrays, createPrimaryButton, createUrlButton } from 'utils/discord/component';

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
                createPrimaryButton(`qna question ${type} ${embedId}`, {
                    label: `${values[type]}`,
                })
            ),
            createUrlButton('https://orefinger.notion.site/Q-A-16956293b1de4aed84e25042d622da34', {
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
                content: '데시보드를 전송하는데에 문제가 발생 하였습니다...! (특수문자가 안될 수 있어요...!)',
                ephemeral: true,
            })
        );
};
