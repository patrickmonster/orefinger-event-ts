import { getDashboard } from 'controllers/guild/authDashbord';

import { createActionRow, createPrimaryButton, createStringSelectMenu } from 'utils/discord/component';
import discord from 'utils/discordApiInstance';

import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['데시보드', '인증설정'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    const type = selectOption.get('타입');

    switch (type) {
        case choices.indexOf('데시보드'):
            getDashboard(guild_id || '').then(async data => {
                switch (true) {
                    case data.length === 0:
                        await interaction.reply({ content: '생성된 데시보드가 없습니다!' });
                        break;
                    case data.length === 1:
                        const { embed, role_id, type, type_id } = data[0];
                        await interaction.reply({ content: '데시보드 출력중...' });
                        discord
                            .post(`/channels/${channel.id}/messages`, {
                                embeds: embed ? [embed] : null,
                                components: [
                                    createActionRow(
                                        createPrimaryButton(`rules oauth ${type_id}`, {
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
            break;
        case choices.indexOf('인증설정'):
            interaction.reply({
                content: `설정하거나, 수정하실 인증을 선택해주세요!`,
                components: await createComponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'rules list',
                        placeholder: '수정하시거나, 제작하실 인증을 선택해주세요!',
                    },
                    QUERY.SelectAuthDashbord,
                    guild_id
                ),
            });
            break;
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 인증을 설정합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '설정 옵션',
            required: true,
            choices: choices.map((choice, index) => ({ name: choice, value: index })),
        },
    ],
};

// 일시적으로 막음 (오픈전)
export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
