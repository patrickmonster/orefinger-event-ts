import { basename } from 'path';
import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';

import getOptions from 'components/chatInputOption';
import { AppChatInputInteraction } from 'interactions/app';
import authTokenSelect from 'components/authTokenSelect';
import onlineChannel from 'components/onlineChannel';
import { channelCreate } from 'components/guild';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction) => {
    const { member, guild_id } = interaction;

    if (!guild_id) {
        return await interaction.re({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });
    }

    let channel_id = getOptions<string>(interaction.options, '채널', '0');
    const user_id = getOptions<string>(interaction.options, '사용자', member?.user?.id || '0');

    console.log('선택자', user_id, channel_id);

    const reply = await interaction.deffer({ ephemeral: true });

    authTokenSelect(user_id, `select online ${channel_id}`, 2).then(async user => {
        if (Array.isArray(user)) {
            reply({ components: user });
        } else {
            if (channel_id === '0') {
                const channel = await channelCreate(guild_id || '0', {
                    name: `📺방송알림`,
                    
                });
                console.log(channel);
            }
            // await onlineChannel(reply, user.user_id, channel_id);
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
