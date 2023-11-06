import {
    APIApplicationCommandInteractionDataBasicOption,
    APIChatInputApplicationCommandInteractionData,
    APIContextMenuInteractionData,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import {
    APIApplicationCommandInteraction,
    APIApplicationCommandInteractionData,
    ApplicationCommandType,
    IReply,
} from 'plugins/discord';

import { join } from 'path';
import autoLoader from 'utils/autoCommand';
import { sendErrorNotFoundComponent } from 'utils/discord/interaction';

type InteractionType = Omit<APIApplicationCommandInteraction, 'data' | 'type'>;
export type appInteraction = IReply & InteractionType & APIApplicationCommandInteractionData;
export type AppChatInputInteraction = IReply & InteractionType & APIChatInputApplicationCommandInteractionData;
export type AppContextMenuInteraction = IReply & InteractionType & APIContextMenuInteractionData;

const [appCommands, apiApp] = autoLoader(join(__dirname, 'app'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: false,
});

const [chatCommand, apiChat] = autoLoader(join(__dirname, 'command'), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: true,
});

/**
 * 채팅입력의 서브 커맨드를 탐색 합니다.
 * @param interaction
 * @returns
 */
const getChatCommandNames = (interaction: AppChatInputInteraction) => {
    const chatCommandNames: string[] = [interaction.name];
    let selectOption: APIApplicationCommandInteractionDataBasicOption[] = [];
    if ('options' in interaction && interaction.options?.length) {
        for (const option of interaction.options) {
            if (
                [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(
                    option.type
                )
            ) {
                chatCommandNames.push(option.name);
                if (option.type == ApplicationCommandOptionType.SubcommandGroup) {
                    chatCommandNames.push(option.options[0].name);
                    if ('options' in option.options[0] && option.options[0].options)
                        selectOption = option.options[0].options;
                } else {
                    if ('options' in option && option.options) selectOption = option.options;
                }
            }
        }
    }
    const chatCommandTarget = chatCommand.find(
        command => command.path.filter(path => chatCommandNames.includes(path)).length === command.path.length
    );

    return { chatCommandTarget, selectOption };
};

const appComponent = async (interaction: appInteraction) => {
    const { type } = interaction;
    console.log('appComponent', interaction.name, type);

    switch (type) {
        case ApplicationCommandType.Message:
        case ApplicationCommandType.User:
            const target = appCommands.find(command => command.name === interaction.name);
            if (target) {
                const { file } = target;
                await require(file).exec(interaction);
            } else sendErrorNotFoundComponent(interaction);
            break;
        case ApplicationCommandType.ChatInput: {
            const { chatCommandTarget, selectOption } = getChatCommandNames(interaction);
            if (chatCommandTarget) {
                const { file } = chatCommandTarget;
                await require(file).exec(interaction, selectOption);
            } else sendErrorNotFoundComponent(interaction);
            break;
        }
    }
};

export const api = {
    app: apiApp,
    chat: apiChat,
};

export default appComponent;
