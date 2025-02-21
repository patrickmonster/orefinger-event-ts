import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * 사용자 정보 선택 - 트수인증
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    // await interaction.re({ content: '준비중입니다.', ephemeral: true });
    const {} = interaction;
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    description: '트위치 알림 설정',
};
