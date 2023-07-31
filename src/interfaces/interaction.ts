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

    // 컴포넌트
    ComponentType,
    ApplicationCommandType,
    ///
    APIMessageComponentInteractionData, // 메세지 처리 (버튼/매뉴등등)
    APIApplicationCommandInteractionData, // 앱 처리
    APIChatInputApplicationCommandInteractionData, // 채팅 입력 슬레시 명령
    APIModalSubmission, // 모달 처리
} from 'discord-api-types/v10';

export type InteractionEvent = {
    raw: {
        body: APIInteraction;
        res: FastifyReply;
    };
    re: (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<void>;
    model: (message: APIModalInteractionResponseCallbackData) => Promise<void>;
    follow: (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<RESTGetAPIChannelMessageResult>;
};
