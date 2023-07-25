import { InteractionEvent } from 'interfaces/interaction';

const messageComponent = async (interaction: InteractionEvent) => {
    await interaction.re({
        content: '테스트',
    });

    await interaction.follow({
        content: '후행',
    });

    setTimeout(async () => {
        await interaction
            .re({
                content: '대화바꿈!',
            })
            .catch(e => {
                console.error(e);
            });
    }, 1000 * 10);
};

export default messageComponent;
