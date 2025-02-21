import { selectNoticeList } from 'components/notice';
import { MessageInteraction } from 'fastify-discord';
import { catchRedis, REDIS_KEY } from 'utils/redis';

/**
 * 출석체크
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string) => {
    await interaction.differ({ ephemeral: true });

    try {
        interaction.reply(
            // await selectNoticeList(noticeId)
            await catchRedis(
                REDIS_KEY.API.HISTORY_LIVE(noticeId),
                async () => await selectNoticeList(noticeId),
                60 * 60 // 1시간
            )
        );
    } catch (e) {
        // 에러 발생시
        interaction.reply({
            content: '방송 이력을 불러오는중, 실패하였습니다.',
        });
    }
};
