import { selectPshopItemEditByModel, upsertPshopItem } from 'controllers/point';
import { MessageInteraction } from 'interactions/message';

/**
 * 상품을 추가합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const { insertId } = await upsertPshopItem({
        guild_id,
        name: '-',
        detail: '-',
        point: 100,
        use_yn: 'N',
        create_user: member.user.id,
        update_user: member.user.id,
    });

    const modal = await selectPshopItemEditByModel(`${insertId}`);

    interaction.model({
        ...modal,
        custom_id: `pshop edit ${insertId}`,
    });
};