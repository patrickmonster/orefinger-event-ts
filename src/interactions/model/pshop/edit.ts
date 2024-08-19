import { castMessage } from 'components/discord';
import { upsertPshopItem } from 'controllers/point';
import { MessageMenuInteraction } from 'interactions/message';
import { ParseInt } from 'utils/object';

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
    const { guild_id, member } = interaction;
    if (!guild_id || !member) return;

    if (values.message) {
        values.message = await castMessage(guild_id, values.message, true);
    }

    await upsertPshopItem(
        {
            ...values,
            use_yn: 'Y',
            update_user: member.user.id,
        },
        {
            idx: ParseInt(key),
        }
    );

    interaction.reply({
        content: '상품이 수정되었습니다.',
        ephemeral: true,
    });
};
