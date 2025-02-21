import { selectComponentPagingMenuKey } from 'components/systemComponent';
import { MessageMenuInteraction } from 'fastify-discord';

type searchType = {
    label: string;
    value: string;
    description?: string;
};
/**
 * 쿼리키의 검색을 위한 모달
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, key: string) => {
    const { value } = values;

    const colums: searchType = {
        label: value,
        value: value,
        description: value,
    };
    interaction.reply({
        ephemeral: true,
        components: await selectComponentPagingMenuKey(key, 0, colums),
    });
};
