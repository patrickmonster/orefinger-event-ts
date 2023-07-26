import { FastifyReply } from 'fastify';
import {
    APIInteraction,
    APIApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
    APIModalInteractionResponseCallbackData,
} from 'discord-api-types/v10';

import { RESTPostAPIChannelMessageJSONBody, RESTGetAPIChannelMessageResult } from 'discord-api-types/rest/v10';

export type Interaction =
    | APIApplicationCommandInteraction
    | APIMessageComponentInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIModalSubmitInteraction;

export {
    APIApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
} from 'discord-api-types/v10';

export type InteractionEvent = {
    raw: {
        body: APIInteraction;
        res: FastifyReply;
    };
    re: (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<RESTGetAPIChannelMessageResult>;
    follow: (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<RESTGetAPIChannelMessageResult>;
    model: (message: APIModalInteractionResponseCallbackData) => Promise<void>;
};
