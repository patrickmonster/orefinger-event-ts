import {
    InteractionEvent,
    APIApplicationCommandInteraction,
    APIApplicationCommandInteractionData,
    ApplicationCommandType,
} from 'interfaces/interaction';

import autoLoader from 'utils/auto-command';
const getCommand = autoLoader(__filename, {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: appInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

export type appInteraction = InteractionEvent & Omit<APIApplicationCommandInteraction, 'data' | 'type'> & APIApplicationCommandInteractionData;

const appComponent = async (interaction: appInteraction) => getCommand(interaction.name)(interaction);

export default appComponent;

// APIChatInputApplicationCommandInteractionData
// APIUserApplicationCommandInteractionData
// APIMessageApplicationCommandInteractionData
