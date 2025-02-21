import { getGuild } from 'components/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.differ({ ephemeral: false });

    const { guild_id } = interaction;
    if (!guild_id)
        return interaction.reply({
            content: '길드 정보를 가져올 수 없습니다.',
            ephemeral: true,
        });

    const guild = await getGuild(guild_id);

    if (!guild)
        return interaction.reply({
            content: '길드 정보를 가져올 수 없습니다.',
            ephemeral: true,
        });

    interaction.reply({
        content: `${guild.name}
description : ${guild.description}
owner_id : ${guild.owner_id}
region : ${guild.region} / ${guild.preferred_locale}
premium : ${guild.premium_tier}/ ${guild.premium_subscription_count}
${guild.approximate_member_count} members
${guild.approximate_presence_count} online

${guild.features.map(f => ` - ${f}`).join('\n')}
        `,
    });
};

const api = createChatinputCommand(
    {
        description: '길드 가이드 메세지를 생성합니다 (채널리스트)',
        options: [
            {
                description: '길드 ID',
                name: 'guild_id',
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },
    __filename
);

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
