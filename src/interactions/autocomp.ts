import {
    InteractionEvent,
    APIApplicationCommandAutocompleteInteraction,
    APIChatInputApplicationCommandInteractionData,
} from 'interfaces/interaction';

export type autoInteraction = InteractionEvent &
    Omit<APIApplicationCommandAutocompleteInteraction, 'data' | 'type'> &
    APIChatInputApplicationCommandInteractionData;

const autoComponent = async (interaction: autoInteraction) => {
    // 자동완성
};

export default autoComponent;
