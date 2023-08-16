import { InteractionEvent, APIModalSubmitInteraction, APIModalSubmission } from 'plugins/discord';

export type modelInteraction = Omit<InteractionEvent, 'model'> & Omit<APIModalSubmitInteraction, 'data' | 'type'> & APIModalSubmission;

const modelComponent = async (interaction: modelInteraction) => {
    //
};

export default modelComponent;
