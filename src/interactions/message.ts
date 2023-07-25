import { InteractionEvent, APIMessageComponentInteraction } from 'interfaces/interaction';

const messageComponent = async (interaction: InteractionEvent & APIMessageComponentInteraction) => {
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
