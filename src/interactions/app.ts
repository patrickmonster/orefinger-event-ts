import { APIChatInputApplicationCommandInteractionData, APIContextMenuInteractionData } from 'discord-api-types/v10';
import { APIApplicationCommandInteraction, APIApplicationCommandInteractionData, ApplicationCommandType, InteractionEvent } from 'plugins/discord';

import { join } from 'path';
import autoLoader from 'utils/autoCommand';

const [appCommands, apiApp] = autoLoader(join(__dirname, 'app'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: false,
});

const [chatCommand, apiChat] = autoLoader(join(__dirname, 'command'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: true,
    // defaultFunction: async (interaction: appInteraction) => {
    //     console.log('Component: ', interaction.name, 'is not registered.');
    //     await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    // },
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
            const target = appCommands.find(command => command.name === interaction.name);
            if (target) {
                const { file } = target;
                await require(file).exec(interaction);
            }
            break;
        case ApplicationCommandType.ChatInput:
            const chatCommandTarget = chatCommand.find(command => command.name === interaction.name);
            if (chatCommandTarget) {
                const { file } = chatCommandTarget;
                await require(file).exec(interaction);
            }
            break;
    }
};

export const api = [...apiApp, ...apiChat];
export default appComponent;
