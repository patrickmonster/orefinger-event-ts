import { createComponent, getComponentBaseEditByModel } from 'controllers/component';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    //

    const { insertId } = await createComponent({ name: '임시항목' });
    const model = await getComponentBaseEditByModel(insertId);

    // 모달처리
    interaction.model({
        ...model,
        custom_id: `component edit ${insertId}`,
    });
};
