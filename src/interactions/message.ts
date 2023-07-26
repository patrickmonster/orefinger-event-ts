import { InteractionEvent, APIMessageComponentInteraction, APIMessageComponentInteractionData } from 'interfaces/interaction';

export type messageInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data'> & APIMessageComponentInteractionData;

const messageComponent = async (interaction: messageInteraction) => {
    const { custom_id } = interaction;

    interaction.re({
        content: '테스트',
    });
};

export default messageComponent;
