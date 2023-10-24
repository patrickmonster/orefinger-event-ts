import { APIModalSubmission, APIModalSubmitInteraction, IReply } from 'plugins/discord';

export type modelInteraction = IReply & Omit<APIModalSubmitInteraction, 'data' | 'type'> & APIModalSubmission;

const modelComponent = async (interaction: modelInteraction) => {
    //
};

export default modelComponent;
