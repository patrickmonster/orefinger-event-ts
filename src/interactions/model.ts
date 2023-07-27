import { InteractionEvent, APIModalSubmitInteraction, APIModalSubmission } from 'interfaces/interaction';

export type modelInteraction = InteractionEvent & Omit<APIModalSubmitInteraction, 'data' | 'type'> & APIModalSubmission;

const modelComponent = async (interaction: modelInteraction) => {
    //
};

export default modelComponent;
