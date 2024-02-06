import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/noticeListQuerys';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    // TODO: 알림 설정 - 개인 메세지도 추후....

    interaction.reply({
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: 'notice list',
                placeholder: '설정하실 알림을 선택해주세요.',
            },
            QUERY.SelectNoticeDashbord
        ),
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 알림을 설정합니다.',
};

// 인터렉션 이벤트
export default api;
