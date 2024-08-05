import { addPoint, getPoint } from 'controllers/point';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { createChatinputCommand } from 'utils/discord/component';
import sleep from 'utils/sleep';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { user, member } = interaction;

    const userId = user?.id || member?.user.id;

    const mount = selectOption.get<number>('포인트');
    const point = await getPoint(userId || '');

    if (point < mount) {
        return interaction.reply({
            ephemeral: true,
            content: `포인트가 부족합니다. - 현재 포인트: ${point}점`,
        });
    }
    console.log('point', point);
    const randomNumFloor = Math.floor(Math.random() * 80 + 10); // 10 ~ 90

    interaction
        .reply({
            ephemeral: true,
            embeds: [
                {
                    title: '@@ 확률성 게임 @@',
                    description: `
${mount.toLocaleString()}점을 사용하여 게임을 시작합니다.
확율: ${randomNumFloor}%
                    `,
                    footer: {
                        text: `잔여 포인트 ${point.toLocaleString()}점`,
                        icon_url: `https://cdn.discordapp.com/avatars/${userId}/${
                            member?.avatar || user?.avatar || member?.user.avatar
                        }.png`,
                    },
                },
            ],
        })
        .then(() =>
            sleep(1000).then(async () => {
                const number = Math.floor(Math.random() * 99) + 1; // 1 ~ 100
                const result = number >= randomNumFloor;

                const point = await addPoint(
                    userId || '',
                    mount * (result ? 1 : -1),
                    `확률성 게임 ${result ? '+' : '-'}${mount.toLocaleString()}`
                );
                if (point < 0) {
                    return interaction.reply({
                        ephemeral: true,
                        content: `포인트가 부족합니다.`,
                    });
                }

                interaction.reply({
                    ephemeral: true,
                    embeds: [
                        {
                            title: `${result ? '성공' : '실패'} 하였습니다.`,
                            description: `
${mount.toLocaleString()}점 사용하여 게임 진행 하였습니다.
확률: ${randomNumFloor}%

게임 결과:
${result ? '성공' : '실패'} ${result ? '+' : '-'}${mount.toLocaleString()}점
                            `,
                            footer: {
                                text: `잔여 포인트 ${point.toLocaleString()}점`,
                                icon_url: `https://cdn.discordapp.com/avatars/${userId}/${
                                    member?.avatar || user?.avatar || member?.user.avatar
                                }.png`,
                            },
                        },
                    ],
                });
            })
        );
};

const api = createChatinputCommand(
    {
        description: '포인트를 이용하여 확율성 게임을 진행 합니다.',
        options: [
            {
                name: '포인트',
                description: '도박에 사용하실 포인트(최소 10포인트)',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 10,
            },
            // {
            //     name: '확률',
            //     description: '확률을 입력해주세요.',
            //     type: ApplicationCommandOptionType.Integer,
            //     max_value: 90,
            //     min_value: 1,
            // },
        ],
        dm_permission: true,
    },
    __filename
);
export default api;
