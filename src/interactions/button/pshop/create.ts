import { selectPshopItemEditByModel, upsertGuildPoint, upsertPshopItem } from 'controllers/point';
import { MessageInteraction } from 'interactions/message';

/**
 * 상품을 추가합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    const { guild_id, message, channel, member, user } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const userId = user?.id || member?.user.id;
    const userName = user?.username || member?.user.username;

    upsertGuildPoint({
        auth_id: userId,
        guild_id: guild_id,
        guild_name: userName,
        channel_id: channel.id,
    }).catch(console.error);

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
