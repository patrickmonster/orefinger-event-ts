import { APIMessageButtonInteractionData, APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import { join } from 'path';
import { APIMessageComponentInteraction, APIMessageComponentInteractionData, ComponentType, InteractionEvent } from 'plugins/discord';
import autoLoader from 'utils/autoCommand';

export type MessageInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageComponentInteractionData;
export type MessageButtonInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageButtonInteractionData;
export type MessageMenuInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageSelectMenuInteractionData;

const [, getButtonCommand] = autoLoader(join(__dirname, 'button'), {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: MessageInteraction) => {
        console.log('Component: ', interaction.id, 'is not registered.');
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

const [, getMenuCommand] = autoLoader(join(__dirname, 'menu'), {
    pathTag: ' ',
    isLog: true,
    defaultFunction: async (interaction: MessageInteraction) => {
        console.log('Component: ', interaction.id, 'is not registered.');
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

const messageComponent = async (interaction: MessageInteraction) => {
    const { custom_id, component_type } = interaction;
    // const id = custom_id.startsWith() ? custom_id.substring(4) : custom_id;

    console.log('Component: ', custom_id, interaction);

    switch (component_type) {
        case ComponentType.Button:
            getButtonCommand(custom_id)<MessageButtonInteraction>(interaction);
            break;
        case ComponentType.StringSelect:
        case ComponentType.ChannelSelect:
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
        case ComponentType.MentionableSelect:
            getMenuCommand(custom_id)<MessageMenuInteraction>(interaction);
            break;
    }
};

export default messageComponent;
