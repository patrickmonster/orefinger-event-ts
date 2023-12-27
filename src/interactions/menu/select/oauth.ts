import {
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    ComponentType,
} from 'discord-api-types/v10';
import { basename } from 'path';
import { MessageMenuInteraction } from 'interactions/message';
import { getDashboard } from 'controllers/guild/authDashbord';

import { createActionRow, createPrimaryButton, createStringSelectMenu } from 'utils/discord/component';

import discord from 'utils/discordApiInstance';

/**
 *
 * 인증 데시보드 선택
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, []: string[]) => {
    const {
        values: [type_id],
        guild_id,
        channel,
    } = interaction;

    await interaction.differ({ ephemeral: true });

    getDashboard(guild_id || '', type_id).then(async data => {
        if (!data.length) {
            await interaction.reply({ content: '생성된 데시보드가 없습니다!' });
        } else {
            const { embed, role_id, type, type_id } = data[0];
            await interaction.reply({ content: '데시보드 출력중...' });
            discord
                .post(`/channels/${channel.id}/messages`, {
                    embeds: embed ? [embed] : null,
                    components: [
                        createActionRow(
                            createPrimaryButton(`rule oauth ${type_id}`, {
                                label: `인증 - ${type}`,
                                emoji: { name: '🔐' },
                            })
                        ),
                    ],
                })
                .catch(e => {
                    console.log(e.response.data);
                    interaction.reply({
                        content: '데시보드 출력에 실패 하였습니다 X﹏X - 관리자에게 문의 바랍니다',
                    });
                });
        }
    });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
