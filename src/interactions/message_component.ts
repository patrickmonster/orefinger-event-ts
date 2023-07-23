import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { APIInteraction } from 'discord-api-types/v10';

import { InteractionEvent } from 'interfaces/interaction';

const messageComponent = async (interaction: InteractionEvent) => {
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