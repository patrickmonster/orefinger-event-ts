import { InteractionEvent, APIApplicationCommandInteraction, APIApplicationCommandInteractionData } from 'interfaces/interaction';

import autoLoader from 'utils/auto-command';
let getCommand: Function = () => {};
autoLoader(__filename, {
    pathTag: ' ',
    defaultFunction: async (interaction: appInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
}).then(func => (getCommand = func));

export type appInteraction = InteractionEvent & Omit<APIApplicationCommandInteraction, 'data'> & APIApplicationCommandInteractionData;

const appComponent = async (interaction: appInteraction) => {
    // ??
};

export default appComponent;

// APIChatInputApplicationCommandInteractionData
// APIUserApplicationCommandInteractionData
// APIMessageApplicationCommandInteractionData
