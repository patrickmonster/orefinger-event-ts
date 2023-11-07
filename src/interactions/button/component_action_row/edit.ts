import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import {
    ParseInt,
    copyComponentActionRow,
    selectComponentActionRowEditByModel,
    selectComponentRowDtilByEmbed,
    selectComponentRowEditByOrder,
    updateComponentActionRowConnect,
    upsertComponentActionRowConnect,
} from 'controllers/component';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

import QUERY from 'controllers/component/embedListQuerys';

const componentActionRowReload = async (interaction: MessageInteraction, component_row_id: string) => {
    interaction.edit({
        embeds: [await selectComponentRowDtilByEmbed(component_row_id)],
    });
};

const componentActionRowOptionEdit = async (interaction: MessageInteraction, component_row_id: string) => {
    interaction.reply({
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `component_action_row edit ${component_row_id} option`,
                placeholder: '컴포넌트를 선택해주세요!',
                disabled: false,
                max_values: 5,
                min_values: 0,
            },
            QUERY.ComponentActionRowConnectionByMenuListQuery,
            ParseInt(component_row_id)
        ),
    });
};

const componentActionRowOrderView = async (interaction: MessageInteraction, component_row_id: string) => {
    interaction.reply({
        ephemeral: true,
        components: [
            await selectComponentRowEditByOrder(
                component_row_id,
                `component_action_row edit ${component_row_id} order`
            ),
        ],
    });
};

const componentActionRowOrderEdit = async (
    interaction: MessageInteraction,
    component_row_id: string,
    component_id: string
) => {
    const {
        component,
        message: { components },
        custom_id,
    } = interaction;

    if (!component) return;
    const selectItemCount = component.components.filter(v => {
        if (v.type !== ComponentType.Button || v.style == ButtonStyle.Link) return false;
        if (v.custom_id == custom_id) v.disabled = true;

        return v.disabled;
    }).length;

    if (selectItemCount <= 1) await updateComponentActionRowConnect(component_row_id, null, { sort_number: 99 });
    await upsertComponentActionRowConnect({
        component_row_id: parseInt(component_row_id),
        component_id: parseInt(component_id),
        sort_number: selectItemCount,
    });

    interaction.edit({ components });
};

const componentActionRowCopy = async (interaction: MessageInteraction, component_row_id: string) => {
    const { insertId } = await copyComponentActionRow(component_row_id);
    interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
};

const componentActionRowEdit = async (interaction: MessageInteraction, component_row_id: string) => {
    interaction.model({
        ...(await selectComponentActionRowEditByModel(component_row_id)),
        custom_id: `component_action_row edit ${component_row_id}`,
    });
};

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (
    interaction: MessageInteraction,
    component_row_id: string,
    type: string,
    component_id: string
) => {
    switch (type) {
        case 'reload':
            return await componentActionRowReload(interaction, component_row_id);
        case 'option':
            return await componentActionRowOptionEdit(interaction, component_row_id);
        case 'order':
            if (!component_id) {
                return await componentActionRowOrderView(interaction, component_row_id);
            } else {
                return await componentActionRowOrderEdit(interaction, component_row_id, component_id);
            }
        case 'copy':
            return await componentActionRowCopy(interaction, component_row_id);
        case 'edit':
            return await componentActionRowEdit(interaction, component_row_id);
    }
};
