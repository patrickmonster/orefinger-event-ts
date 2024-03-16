import { searchLaftelVod } from 'components/laftelUser';
import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/embedListQuerys';
import { MessageInteraction } from 'interactions/message';
import { createTextShortInput } from 'utils/discord/component';
import menuComponentBuild from 'utils/menuComponentBuild';

/**
 * 알림 추가 - 검색버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeType: string) => {
    const { guild_id } = interaction;
    switch (noticeType) {
        case '2': {
            // 유튜브
            interaction.model({
                components: [
                    createTextShortInput(`value`, {
                        label: '채널명을 입력해주세요.',
                        placeholder: 'youtubeId or 채널명',
                        max_length: 50,
                        min_length: 1,
                        required: true,
                    }),
                ],
                custom_id: `notice add ${noticeType}`,
                title: '유튜브 - 알림추가',
            });
            break;
        }
        case '3': {
            // 인증알림 (내부적인 검색을 하지 않기 때문에 필요없음)
            interaction.reply({
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `notice add ${noticeType}`,
                        placeholder: '인증 타입을 선택해 주세요!',
                        max_values: 1,
                        min_values: 1,
                    },
                    QUERY.SelectAuthDashbordNotice,
                    guild_id
                ),
                ephemeral: true,
            });
        }
        case '4': {
            // 치지직
            interaction.model({
                components: [
                    createTextShortInput(`value`, {
                        label: '채널명을 입력해주세요.',
                        placeholder: '채널명 or 32자리 영-숫자 조합입니다.',
                        max_length: 50,
                        min_length: 1,
                        required: true,
                    }),
                ],
                custom_id: `notice add ${noticeType}`,
                title: '치치직 - 알림추가',
            });
            break;
        }
        case '5': {
            // 치지직
            interaction.model({
                components: [
                    createTextShortInput(`value`, {
                        label: '채널명을 입력해주세요.',
                        placeholder: '채널명 or afreecaId',
                        max_length: 50,
                        min_length: 1,
                        required: true,
                    }),
                ],
                custom_id: `notice add ${noticeType}`,
                title: '아프리카 - 알림추가',
            });
            break;
        }
        case '7': {
            // 라프텔
            await interaction.differ({ ephemeral: true });

            interaction.reply({
                content: '콘텐츠를 설정할 수 없습니다.',
                components: menuComponentBuild(
                    {
                        custom_id: `notice add ${noticeType}`,
                        placeholder: '원하시는 VOD를 선택해주세요.',
                        max_values: 1,
                        min_values: 1,
                    },
                    ...(await searchLaftelVod()).map(({ name, value }) => ({ label: name, value }))
                ),
            });
            break;
        }
    }
};
