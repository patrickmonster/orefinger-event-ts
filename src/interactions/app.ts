import { APIChatInputApplicationCommandInteractionData, APIContextMenuInteractionData } from 'discord-api-types/v10';
import { APIApplicationCommandInteraction, APIApplicationCommandInteractionData, ApplicationCommandType, InteractionEvent } from 'plugins/discord';

import { join } from 'path';
import autoLoader from 'utils/autoCommand';
const [appCommands, getAppCommand] = autoLoader(join(__dirname, 'app'), {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: appInteraction) => {
        console.log('Component: ', interaction.name, 'is not registered.');
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

const [chatCommand, getChatCommand] = autoLoader(join(__dirname, 'command'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: false,
    defaultFunction: async (interaction: appInteraction) => {
        console.log('Component: ', interaction.name, 'is not registered.');
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

export const api = [...appCommands, ...chatCommand];
export default appComponent;

// /applications/{application.id}/commands

// export { appCommands, chatCommand };

// APIChatInputApplicationCommandInteractionData
// APIUserApplicationCommandInteractionData
// APIMessageApplicationCommandInteractionData
