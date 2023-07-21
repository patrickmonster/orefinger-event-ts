import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { APIInteraction } from 'discord-api-types/v10';

import { InteractionEvent } from 'interfaces/interaction';

const messageComponent = (interaction: InteractionEvent) => {
    const { data } = interaction;
    //
};

export default messageComponent;
