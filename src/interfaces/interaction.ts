import { FastifyReply } from 'fastify';
import {
    APIInteraction,
    APIApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
} from 'discord-api-types/v10';

import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/rest/v10';

export type Interaction =
    | APIApplicationCommandInteraction
    | APIMessageComponentInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIModalSubmitInteraction;

export type InteractionEvent = Interaction & {
    raw: {
        body: APIInteraction;
        res: FastifyReply;
    };
    re: (message: RESTPostAPIChannelMessageJSONBody | string) => void;
};
