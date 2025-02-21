import { APIInteraction, InteractionType } from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-interactions';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    let app: any = null;
    let message: any = null;
    let model: any = null;
    let autocomp: any = null;

    fastify.server.on('listening', () => {
        console.log('onListen :: Load interactions');

        app = require('interactions/app').default;
        autocomp = require('interactions/autocomp').default;
        message = require('interactions/message').default;
        model = require('interactions/model').default;
    });

    fastify.post<{
        Body: APIInteraction;
    }>(
        '/bot',
        {
            preHandler: [fastify.verifyDiscordKey],
            schema: {
                // hide: true,
                description: '봇 인터렉션 이벤트 수신부 - 연결 및 사용 X',
                summary: '인터렉션 이벤트',
                tags: ['Util'],
                deprecated: false,
            },
        },
        (req, res) => {
            const { body } = req;

            // 자동완성처리
            if (body.type === InteractionType.ApplicationCommandAutocomplete) {
                return autocomp(body.data, (choices: Array<{ name: string; value: string }>) => {
                    console.log('choices', choices);

                    res.status(200).send({
                        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
                        data: { choices },
                    });
                });
            }

            // 응답이 유동적인 처리를 해야함.
            const interaction = fastify.decorateInteractionReply(req, res);

            fastify.log.info(
                'interactionEvent',
                body.type,
                body.guild_id,
                body?.channel_id || 'DM',
                body.member?.user?.id,
                body.id
            );

            switch (interaction.type) {
                case InteractionType.ApplicationCommand:
                    app && app(interaction);
                    break;
                case InteractionType.MessageComponent:
                    message && message(interaction);
                    break;
                case InteractionType.ModalSubmit:
                    model && model(interaction);
                    break;
                default:
                    break;
            }
        }
    );
};
