import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { ChannelType } from 'discord-api-types/v10';
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
        guild_id,
    } = interaction;

    if (!guild_id) return;

    const { embed, channels } = await selectNoticeDtilByEmbed(notice_id, guild_id);

    console.log('channels', channels, embed);

    interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: [
            createChannelSelectMenu(`notice channel ${notice_id}`, {
                placeholder: '알림을 받을 채널을 선택해주세요.',
                default_values: channels,
                channel_types: [ChannelType.GuildText],
                max_values: 25,
                min_values: 1,
            }),
            editerComponent(`notice channel ${notice_id}`, [], true),
        ],
    });
};
