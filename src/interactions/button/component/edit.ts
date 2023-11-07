import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { copyComponent, selectComponentBaseEditByModel, selectComponentDtilByEmbed } from 'controllers/component';

import QUERY from 'controllers/component/embedListQuerys';

const componentReload = async (interaction: MessageInteraction, component_id: string) => {
    interaction.edit({
        embeds: [await selectComponentDtilByEmbed(component_id)],
    });
};

const componentOption = async (interaction: MessageInteraction, component_id: string) => {
    interaction.reply({
        ephemeral: true,
        content: `${component_id}`,
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `component edit ${component_id} option`,
                placeholder: '컴포넌트를 선택해주세요!',
                disabled: false,
                max_values: 15,
                min_values: 0,
            },
            QUERY.ComponentOptionConnectionByMenuListQuery,
            component_id
        ),
    });
};

const componentEdit = async (interaction: MessageInteraction, component_id: string) => {
    const model = await selectComponentBaseEditByModel(component_id);

    // 모달처리
    interaction.model({
        ...model,
        custom_id: `component edit ${component_id}`,
    });
};

const componentText = async (interaction: MessageInteraction, component_id: string) => {
    interaction.reply({
        ephemeral: true,
        content: `${component_id}] 라벨변경`,
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `component edit ${component_id} text`,
                placeholder: '적용하실 라벨을 선택해 주세요.',
                disabled: false,
                max_values: 1,
                min_values: 0,
            },
            QUERY.TextMessageDefaultByMenuListQuery(
                `SELECT label_id FROM component c WHERE 1=1 AND c.embed_id = ?`,
                component_id
            ),
            component_id
        ),
    });
};

const componentCopy = async (interaction: MessageInteraction, component_id: string) => {
    const { insertId } = await copyComponent(component_id);
    interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
};

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, component_id: string, target: string) => {
    const baseId = `component edit ${component_id}`;
    switch (target) {
        case 'reload':
            return await componentReload(interaction, component_id);
        case 'option':
            return await componentOption(interaction, component_id);
        case 'edit':
            return await componentEdit(interaction, component_id);
        case 'text':
            return await componentText(interaction, component_id);
        case 'copy':
            return await componentCopy(interaction, component_id);
    }
};
