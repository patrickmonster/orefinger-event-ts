import { upsertEmbedUser } from 'controllers/embed';
import { MessageMenuInteraction } from 'interactions/message';

/**
 * 알림을 수정합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, embedId: string) => {
    const { guild_id, channel, user, member } = interaction;
    const user_id = user?.id || member?.user.id;

    await upsertEmbedUser(
        {
            ...values,
            use_yn: 'Y',
            update_user: user_id,
        },
        embedId
    );

    interaction.reply({
        content: '변경되었습니다! - (새로고침 버튼을 눌러, 변경사항을 확인해주세요!)',
        ephemeral: true,
    });
};
