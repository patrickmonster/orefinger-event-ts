import { MessageMenuInteraction } from 'fastify-discord';

import discord from 'utils/discordApiInstance';

/**
 *
 * 사용자 음성채널
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, [role_id]: string[]) => {
    const {
        user,
        member,
        values: [channelId],
        guild_id,
    } = interaction;

    const targetUser = member ? member.user : user;

    discord
        .patch(`/guilds/${guild_id}/voice-states/${targetUser?.id}`, {
            body: { channel_id: channelId },
        })
        .then(() => {
            interaction.reply({
                ephemeral: true,
                content: '음성 채널로 이동했습니다.',
            });
        })
        .catch(() => {
            interaction.reply({
                ephemeral: true,
                content: '음성 대기 채널에 접근하지 않았거나, `맴버 이동`권한이 활성화 되지 않았습니다',
            });
        });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
