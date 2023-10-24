import { MessageMenuInteraction } from 'interactions/message';

import { getComponentDtil } from 'controllers/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        user,
        values: [message_id],
    } = interaction;

    // const reply = await interaction.deffer({ ephemeral: true });

    getComponentDtil(message_id).then(component => {
        const {
            component_id,
            name,
            label_id,
            label_lang,
            type_idx,
            type,
            type_name,
            text_id,
            emoji,
            custom_id,
            value,
            style,
            style_name,
            min_values,
            max_values,
            disabled,
            required,
            use_yn,
            edit,
            permission_type,
            create_at,
            update_at,
            order_by,
        } = component;
        interaction.reply({
            embeds: [
                {
                    title: `${component_id}]${name}`,
                    description: '',
                },
            ],
        });
    });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
