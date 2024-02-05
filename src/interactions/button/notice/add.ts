import { MessageInteraction } from 'interactions/message';

/**
 * 알림 추가 - 검색버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeType: string) => {
    switch (noticeType) {
        case '2': {
            // 유튜브
            // interaction.model({
            //     components: [
            //         createActionRow({
            //             custom_id: 'name',
            //             label: '이름',
            //             type: 4,

            //         }),
            //     ],
            // });
            break;
        }
        case '3': {
            // 치지직
        }
    }
};
