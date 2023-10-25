import { selectComponentMenuKey } from 'components/systemComponent';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 쿼리키 페이징 처리
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, ...params: string[]) => {
    const { user, guild_id } = interaction;
    const [page, key] = params;
    console.log('컴포넌트 수신', params);

    interaction.edit({
        components: await selectComponentMenuKey(key, Number(page)),
    });
};
