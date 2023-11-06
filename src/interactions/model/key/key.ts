import { selectComponentPagingMenuKey } from 'components/systemComponent';
import { MessageMenuInteraction } from 'interactions/message';

/**
 * 쿼리키의 검색을 위한 모달
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, key: string) => {
    const { value } = values;

    interaction.reply({
        ephemeral: true,
        components: await selectComponentPagingMenuKey(key, 0, {
            label: value,
            value: value,
            description: value,
        }),
    });
};
