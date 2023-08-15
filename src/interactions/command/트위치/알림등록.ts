import { basename } from 'path';
import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';

import getOptions from 'components/chatInputOption';
import { AppChatInputInteraction } from 'interactions/app';
import authTokenSelect from 'components/authTokenSelect';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction) => {
    const { user } = interaction;
    const options = interaction.options?.filter(
        option => ![ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(option.type)
    );

    const channel = getOptions<string>(options, '채널', '0');
    const user_id = getOptions<string>(options, '사용자', user?.id || '0');

    const reply = await interaction.deffer({ ephemeral: true });

    authTokenSelect(user_id, `select online ${channel}`, 2).then(async user => {
        if (Array.isArray(user)) {
            reply({ components: user });
        } else {
            console.log('user', user);
            // await authTusuSelect(reply, guild_id || '', user.auth_id || '0', user.user_id, command || '0');
        }
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '트위치 알림을 등록합니다.',
    options: [
        {
            name: '채널',
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
            description: '알림을 받을 채널을 선택해 주세요!',
            required: true,
        },
        {
            name: '사용자',
            type: ApplicationCommandOptionType.User,
            description: '알림을 등록할 사용자를 선택해 주세요.',
            required: false,
        },
    ],
};

// 인터렉션 이벤트
export default api;
