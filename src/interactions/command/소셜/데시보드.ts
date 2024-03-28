import { getDashboard } from 'controllers/guild/authDashbord';

import {
    createActionRow,
    createChatinputSubCommand,
    createPrimaryButton,
    createStringSelectMenu,
} from 'utils/discord/component';
import discord from 'utils/discordApiInstance';

import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    getDashboard(guild_id || '').then(async data => {
        switch (true) {
            case data.length === 0:
                await interaction.reply({
                    content: `생성된 데시보드가 없습니다! \n/소셜 설정 명령을 통해 데시보드를 생성해 주세요!`,
                });
                break;
            case data.length === 1:
                const { embed, role_id, type, type_id } = data[0];
                await interaction.reply({ content: '데시보드 출력중...' });
                discord
                    .post(`/channels/${channel.id}/messages`, {
                        body: {
                            embeds: embed ? [embed] : null,
                            components: [
                                createActionRow(
                                    createPrimaryButton(`rules oauth ${type_id}`, {
                                        label: `인증 - ${type}`,
                                        emoji: { name: '🔐' },
                                    })
                                ),
                            ],
                        },
                    })
                    .catch(e => {
                        interaction.reply({
                            content: '데시보드 출력에 실패 하였습니다 X﹏X - 관리자에게 문의 바랍니다',
                        });
                    });
                break;
            case data.length > 1:
                interaction.reply({
                    content: `
인증 타입의 데시보드가 여러개 있습니다!
출력하실 데시보드를 선택해주세요!

I] 인증 - 지급역할
================
${data.map(({ type, role_id }, index) => `${index + 1}] ${type} - <@&${role_id}>`).join('\n')}
                    `,
                    components: [
                        createStringSelectMenu(`select oauth ${guild_id}`, {
                            options: data.map(({ type_id, type }) => ({
                                label: `${type}`,
                                value: `${type_id}`,
                            })),
                        }),
                    ],
                });
                break;
        }
    });
};

const api = createChatinputSubCommand(
    {
        description: '소셜 인증 데시보드를 출력합니다.',
    },
    __filename
);

export default api;
