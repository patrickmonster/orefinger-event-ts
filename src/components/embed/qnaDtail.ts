import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { MessageInteraction } from 'fastify-discord';
export const postBord = async (interaction: MessageInteraction, embedId: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;
    const { embed } = await selectEmbedUserDtilByEmbed(embedId);

    await interaction.differ({ ephemeral: true });

    // await messageCreate(channel.id, {
    //     embeds: embed ? [embed] : embed,
    //     components: createButtonArrays(
    //         ...types.map(type =>
    //             createPrimaryButton(`qna question ${type} ${embedId}`, {
    //                 label: `${values[type]}`,
    //             })
    //         ),
    //         createSuccessButton('qna help', {
    //             emoji: { name: '❓' },
    //         })
    //     ),
    // })
    //     .then(() => {
    //         interaction.remove();
    //         //
    //     })
    //     .catch(() =>
    //         interaction.reply({
    //             content: '데시보드를 전송하는데에 문제가 발생 하였습니다...! 권한을 확인 해 주세요!',
    //             ephemeral: true,
    //         })
    //     );
};
