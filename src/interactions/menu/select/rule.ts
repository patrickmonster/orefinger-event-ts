import {
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    ComponentType,
} from 'discord-api-types/v10';
import { basename } from 'path';
import { MessageMenuInteraction } from 'interactions/message';
import { getDashboard } from 'controllers/guild/authDashbord';

import { createActionRow, createPrimaryButton, createStringSelectMenu } from 'utils/discord/component';

import discord from 'utils/discordApiInstance';

/**
 *
 * 인증 데시보드 선택
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, type_id: string) => {
    const {
        values: [user_id],
        guild_id,
        channel,
    } = interaction;

    await interaction.differ({ ephemeral: true });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
