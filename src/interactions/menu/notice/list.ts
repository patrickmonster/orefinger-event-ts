import { MessageMenuInteraction } from 'interactions/message';

import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { APISelectMenuDefaultValue, ChannelType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { createChannelSelectMenu } from 'utils/discord/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        message: { components },
        values: [notice_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const { embed, channel_id, notice_channel_id } = await selectNoticeDtilByEmbed(notice_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        await interaction.edit({ components });

        const default_values: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Channel>[] = [];
        if (channel_id && notice_channel_id)
            default_values.push({
                id: channel_id,
                type: SelectMenuDefaultValueType.Channel,
            });

        interaction.follow({
            content: `알림 정보를 수정합니다. - ${notice_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                createChannelSelectMenu(`notice edit ${notice_channel_id}`, {
                    placeholder: '알림 채널을 선택해주세요.',
                    default_values,
                    channel_types: [ChannelType.GuildText],
                    max_values: 1,
                    min_values: 1,
                }),
            ],
        });
    }
};
