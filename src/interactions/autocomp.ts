import { FastifyReply } from 'fastify';
import { InteractionEvent, APIApplicationCommandAutocompleteInteraction, APIChatInputApplicationCommandInteractionData } from 'plugins/discord';

const autoComponent = async (interaction: APIApplicationCommandAutocompleteInteraction, res: FastifyReply) => {
    // 자동완성
    const { name, options } = interaction.data as APIChatInputApplicationCommandInteractionData;

    const result = (name: string) => {
        //  응답부
    };
};

export default autoComponent;
