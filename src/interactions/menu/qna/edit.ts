import { selectQnaTypesByMenu } from 'controllers/guild/qna';
import { APIActionRowComponent, APIModalActionRowComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'fastify-discord';
import { createTextShortInput } from 'utils/discord/component';

/**
 * 질문 응답
 *   - 최종 출력 전, 버튼을 수정 합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, embedId: string) => {
    const { values, guild_id } = interaction;

    if (!guild_id) return;

    if (!values.length) {
        return interaction.remove();
    }

    const list = await selectQnaTypesByMenu(); // 옵션 리스트

    interaction.model({
        custom_id: `qna print ${embedId}`,
        title: '질문 응답 제작',
        components: values
            .map((value, index) => {
                const item = list.find(item => item.value === value);
                if (!item) return null;

                return createTextShortInput(`${value}`, {
                    label: `${item.label} 버튼 명`,
                    value: `${item.label}`,
                    min_length: 1,
                    max_length: 10,
                    placeholder: '버튼 명을 입력 해 주세요.',
                });
            })
            .filter(item => item) as APIActionRowComponent<APIModalActionRowComponent>[],
    });
};
