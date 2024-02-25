import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['데시보드', '인증설정'];

export const exec = async (interaction: AppChatInputInteraction) => {
    const { guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

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
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 인증을 설정합니다.',
    options: [],
};

export default api;
