import { MessageInteraction } from 'interactions/message';
import { createTextShortInput } from 'utils/discord/component';

/**
 * 알림 추가 - 검색버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeType: string) => {
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
    }
};
