import { selectAttachMessage } from 'components/notice';
import { MessageInteraction } from 'interactions/message';
import { REDIS_KEY, catchRedis } from 'utils/redis';

/**
 * 출석체크
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string) => {
    const { user, member, guild_id } = interaction;

    const userId = `${user?.id || member?.user.id}`;

    await interaction.differ({ ephemeral: true });

    try {
        interaction.reply(
            await catchRedis(
                REDIS_KEY.API.ATTACH_LIVE(noticeId, userId),
                async () => await selectAttachMessage(noticeId, userId, guild_id),
                60 * 60 // 1시간
            )
        );
    } catch (e) {
        // 에러 발생시
        interaction.reply({
            content: '출석 체크를 실패하였습니다.',
        });
    }
};
