import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { APIInteraction } from 'discord-api-types/v10';

import { InteractionEvent } from 'interfaces/interaction';

const messageComponent = (interaction: InteractionEvent) => {
    interaction.re({
        content: '테스트',
    });
};

export default messageComponent;
