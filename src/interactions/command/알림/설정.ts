import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { list } from 'controllers/notice';
import { AppChatInputInteraction } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['인증', '방송', '영상'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectㅎOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    const type = selectOption.get('타입');

    switch (type) {
        case choices.indexOf('인증'): {
            break;
        }
        case choices.indexOf('방송'): {
            const noticeList = await list(guild_id);

            interaction.reply({
                content: `
${noticeList.map(notice => `**<#${notice.channel_id}>** - ${notice.notice_type_tag}`).join('\n')}
                `,
            });
            break;
        }
        case choices.indexOf('영상'): {
            break;
        }
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 알림을 설정합니다.',
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
