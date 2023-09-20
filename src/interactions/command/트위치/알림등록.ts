import { basename } from 'path';
import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';

import getOptions from 'components/chatInputOption';
import { AppChatInputInteraction } from 'interactions/app';
import authTokenSelect from 'components/authTokenSelect';
import onlineChannel from 'components/onlineChannel';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction) => {
    const { member } = interaction;

    const channel = getOptions<string>(interaction.options, '채널', '0');
    const user_id = getOptions<string>(interaction.options, '사용자', member?.user?.id || '0');

    console.log('선택자', user_id, channel);

    const reply = await interaction.deffer({ ephemeral: true });

    authTokenSelect(user_id, `select online ${channel}`, 2).then(async user => {
        if (Array.isArray(user)) {
            reply({ components: user });
        } else {
            await onlineChannel(reply, user.user_id, channel);
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
