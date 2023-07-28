import autoLoader from 'utils/auto-command';
import { InteractionEvent, ComponentType, APIMessageComponentInteraction, APIMessageComponentInteractionData } from 'interfaces/interaction';

import { cpSync } from 'fs';

export type messageInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageComponentInteractionData;

let getCommand: Function = () => {};
autoLoader(__filename, {
    pathTag: ' ',
    defaultFunction: async (interaction: messageInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
}).then(func => (getCommand = func));

const messageComponent = async (interaction: messageInteraction) => {
    const { custom_id, component_type } = interaction;
    const id = custom_id.startsWith(process.env.discriminator || '') ? custom_id.substring(4) : custom_id;

    switch (component_type) {
        case ComponentType.Button:
            getCommand(`button ${id}`)(interaction);
            break;
        case ComponentType.StringSelect:
        case ComponentType.ChannelSelect:
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
        case ComponentType.MentionableSelect:
            // case ComponentType.TextInput:
            getCommand(`menu ${id}`)(interaction);
            break;
    }
};

export default messageComponent;
