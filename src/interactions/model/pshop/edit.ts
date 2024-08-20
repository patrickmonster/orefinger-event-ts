import { upsertPshopItem } from 'controllers/point';
import { MessageMenuInteraction } from 'interactions/message';
import { isNumeric, ParseInt } from 'utils/object';

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
    const {
        guild_id,
        member,
        message: { components },
    } = interaction;
    if (!guild_id || !member) return;

    if (values.point && !isNumeric(values.point)) {
        return interaction.reply({
            content: '포인트는 숫자만 입력 가능합니다.',
            ephemeral: true,
        });
    }

    // await interaction.edit({ components });

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
