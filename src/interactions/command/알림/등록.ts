import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { getChzzkUser } from 'components/chzzkUser';
import { getNoticeDetailByEmbed } from 'components/notice';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    // TODO: 알림 설정 - 개인 메세지도 추후....

    await interaction.differ({ ephemeral: true });

    // 사용자 프로필 수신
    //  https://api.chzzk.naver.com/service/v1/channels/ec857bee6cded06df19dae85cf37f878

    const chzzkHash = selectOption.get<string>('치지직');
    if (chzzkHash && hashIdChzzk.test(chzzkHash)) {
        const noticeId = await getChzzkUser(chzzkHash);
        if (noticeId) {
            const { embed, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
                components,
            });
        } else {
            interaction.reply({
                content: '치지직 사용자를 찾을 수 없습니다.',
            });
        }
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 알림을 등록합니다.',
    options: [
        {
            name: '치지직',
            description: '사용자의 치지직 정보를 조회합니다.',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],
};

export default api;
