import { InteractionEvent, APIMessageComponentInteraction } from 'interfaces/interaction';

export type messageInteraction = InteractionEvent & APIMessageComponentInteraction;

const messageComponent = async (interaction: messageInteraction) => {
    await interaction.re({
        content: '테스트',
    });

    setTimeout(async () => {
        await interaction.re({
            content: '대화바꿈!',
        });
    }, 1000 * 10);
};

export default messageComponent;
