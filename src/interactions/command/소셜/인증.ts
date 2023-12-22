import { getAuthbordeList, getDashboard } from 'controllers/guild/authDashbord';

import discord from 'utils/discordApiInstance';
import { createPrimaryButton, createStringSelectMenu } from 'utils/discord/component';

import {
    APIApplicationCommandSubcommandOption,
    APIButtonComponent,
    ComponentType,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';

const createConponentSelectMenuByComponentPagingMenuByKey = async (
    options: {
        custom_id: string;
        placeholder: string;
        button?: APIButtonComponent;
    },
    query: string,
    ...params: any[]
) => {
    return await selectComponentPagingMenuByKey(
        {
            custom_id: options.custom_id,
            placeholder: options.placeholder,
            button: options.button,
            disabled: false,
            max_values: 1,
            min_values: 1,
        },
        query,
        ...params
    );
};

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
                        const { embed, role_id, type } = data[0];
                        await interaction.reply({ content: '데시보드 출력중...' });
                        discord
                            .post(`/channels/${channel.id}/messages`, {
                                embeds: embed ? [embed] : null,
                                comments: [
                                    {
                                        type: ComponentType.ActionRow,
                                        components: [
                                            createPrimaryButton(`rule ${type} ${role_id}`, {
                                                label: '인증',
                                                emoji: { name: '🔐' },
                                            }),
                                        ],
                                    },
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
                                createStringSelectMenu(`select rule ${guild_id}`, {
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
            // interaction.reply({
            //     content: `설정하거나, 수정하실 인증을 선택해주세요!`,
            //     components: await createConponentSelectMenuByComponentPagingMenuByKey(
            //         {
            //             custom_id: 'embed list',
            //             placeholder: '수정하시거나, 제작하실 인증을 선택해주세요!',
            //         },
            //         QUERY.SelectAuthDashbord,
            //         guild_id
            //     ),
            // });
            // getAuthbordeList(guild_id || '').then(async data => {
            //     interaction.reply({
            //         content: '수정하시거나, 제작하실 인증을 선택해주세요!',
            //         components: [
            //             createStringSelectMenu(`select upsert auth ${guild_id}`, {
            //                 options: data.map(({ auth_type, tag_kr, type, role_id }) => ({
            //                     label: `${tag_kr} - ${role_id || '생성하기'}`,
            //                     value: `${auth_type}`,
            //                 })),
            //             }),
            //         ],
            //     });
            // });
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

// 인터렉션 이벤트
export default api;
