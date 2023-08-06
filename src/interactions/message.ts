import autoLoader from 'utils/autoCommand';
import { InteractionEvent, ComponentType, APIMessageComponentInteraction, APIMessageComponentInteractionData } from 'plugins/discord';
import { APIMessageButtonInteractionData, APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';

export type MessageInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageComponentInteractionData;
export type MessageButtonInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageButtonInteractionData;
export type MessageMenuInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageSelectMenuInteractionData;

const getCommand = autoLoader(__filename, {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: MessageInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

const messageComponent = async (interaction: MessageInteraction) => {
    const { custom_id, component_type } = interaction;
    const id = custom_id.startsWith(process.env.discriminator || '') ? custom_id.substring(4) : custom_id;

    switch (component_type) {
        case ComponentType.Button:
            getCommand(`button ${id}`)<MessageButtonInteraction>(interaction);
            break;
        case ComponentType.StringSelect:
        case ComponentType.ChannelSelect:
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
        case ComponentType.MentionableSelect:
            getCommand(`menu ${id}`)<MessageMenuInteraction>(interaction);
            break;
    }
};

export default messageComponent;
