import { FastifyReply } from 'fastify';
import { APIApplicationCommandInteraction, APIChatInputApplicationCommandInteractionData } from 'plugins/discord';

const autoComponent = async (
    interaction: Omit<APIApplicationCommandInteraction, 'data' | 'type'> &
        APIChatInputApplicationCommandInteractionData,
    res: FastifyReply
) => {
    // 자동완성
    const { name, options } = interaction;

    const result = (name: string) => {
        //  응답부
    };
};

export default autoComponent;
