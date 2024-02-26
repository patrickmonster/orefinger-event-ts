import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { getAfreecabeUser } from 'components/afreecaUser';
import { getChzzkUser } from 'components/chzzkUser';
import { getNoticeDetailByEmbed } from 'components/notice';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');
const hashIdAfreeca = new RegExp('([a-z0-9]+)$');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    // TODO: 알림 설정 - 개인 메세지도 추후....

    await interaction.differ({ ephemeral: true });

    const chzzkHash = selectOption.get<string>('치지직');
    const afreecaHash = selectOption.get<string>('아프리카');
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

    if (afreecaHash && hashIdAfreeca.test(afreecaHash)) {
        const noticeId = await getAfreecabeUser(chzzkHash);
        if (noticeId) {
            const { embed, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
                components,
            });
        } else {
            interaction.reply({
                content: '아프리카 사용자를 찾을 수 없습니다.',
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
            required: false,
            autocomplete: true,
        },
        {
            name: '아프리카',
            description: '사용자의 아프리카 정보를 조회합니다.',
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
        },
    ],
};

export default api;
