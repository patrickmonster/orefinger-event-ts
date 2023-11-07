import { createEmbed } from 'controllers/embed';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 action row 수정
 * TODO: 임베드생성 항목 추가
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    // createEmbed
    // const { insertId } = await createComponent({ name: '임시항목' });
    // const model = await selectComponentBaseEditByModel(insertId);
    // // 모달처리
    // interaction.model({
    //     ...model,
    //     custom_id: `component edit ${insertId}`,
    // });
};
