import { InteractionEvent, APIApplicationCommandInteraction, APIApplicationCommandInteractionData, ApplicationCommandType } from 'plugins/discord';
import { APIChatInputApplicationCommandInteractionData, APIContextMenuInteractionData } from 'discord-api-types/v10';

import autoLoader from 'utils/autoCommand';
import { join } from 'path';
const getAppCommand = autoLoader(join(__dirname, 'app'), {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: appInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

const getChatCommand = autoLoader(join(__dirname, 'command'), {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: appInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

export type appInteraction = InteractionEvent & Omit<APIApplicationCommandInteraction, 'data' | 'type'> & APIApplicationCommandInteractionData;
export type AppChatInputInteraction = InteractionEvent &
    Omit<APIApplicationCommandInteraction, 'data' | 'type'> &
    APIChatInputApplicationCommandInteractionData;
export type AppContextMenuInteraction = InteractionEvent & Omit<APIApplicationCommandInteraction, 'data' | 'type'> & APIContextMenuInteractionData;

const appComponent = async (interaction: appInteraction) => {
    const { type } = interaction;

    switch (type) {
        case ApplicationCommandType.Message:
        case ApplicationCommandType.User:
            getAppCommand(interaction.name)<AppContextMenuInteraction>(interaction);
            break;
        case ApplicationCommandType.ChatInput:
            getChatCommand(interaction.name)<AppChatInputInteraction>(interaction);
            break;
    }
};

export default appComponent;

// APIChatInputApplicationCommandInteractionData
// APIUserApplicationCommandInteractionData
// APIMessageApplicationCommandInteractionData
