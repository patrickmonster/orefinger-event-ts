import { InteractionEvent, APIApplicationCommandInteraction, APIApplicationCommandInteractionData, ApplicationCommandType } from 'plugins/discord';
import { APIChatInputApplicationCommandInteractionData, APIContextMenuInteractionData } from 'discord-api-types/v10';

import autoLoader from 'utils/autoCommand';
const getCommand = autoLoader(__filename, {
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

    // interaction.re({
    //     content: '메세지 테스트',
    //     components: [
    //         {
    //             type: 1,
    //             components: [
    //                 {
    //                     type: 2,
    //                     label: '테스트 버튼',
    //                     style: 1,
    //                     custom_id: 'test',
    //                 },
    //                 {
    //                     type: 2,
    //                     label: '테스트 버튼2',
    //                     style: 1,
    //                     custom_id: 'test2',
    //                 },
    //             ],
    //         },
    //     ],
    // });
    switch (type) {
        case ApplicationCommandType.Message:
        case ApplicationCommandType.User:
            getCommand(interaction.name)<AppContextMenuInteraction>(interaction);
            break;
        case ApplicationCommandType.ChatInput:
            getCommand(interaction.name)<AppChatInputInteraction>(interaction);
            break;
    }
};

export default appComponent;

// APIChatInputApplicationCommandInteractionData
// APIUserApplicationCommandInteractionData
// APIMessageApplicationCommandInteractionData
