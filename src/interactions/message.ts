import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    APIMessageButtonInteractionData,
    APIMessageSelectMenuInteractionData,
} from 'discord-api-types/v10';
import { join } from 'path';
import { APIMessageComponentInteraction, ComponentType, IReply } from 'plugins/discord';
import autoLoader from 'utils/autoCommand';
import { getCommand } from 'utils/interaction';

// 반응한 컴포넌트
export interface EventComponent {
    component: APIActionRowComponent<APIMessageActionRowComponent> | undefined;
}

export type MessageButtonInteraction = IReply &
    Omit<APIMessageComponentInteraction, 'data' | 'type'> &
    APIMessageButtonInteractionData &
    EventComponent;
export type MessageMenuInteraction = IReply &
    Omit<APIMessageComponentInteraction, 'data' | 'type'> &
    APIMessageSelectMenuInteractionData &
    EventComponent;

export type MessageInteraction = MessageButtonInteraction | MessageMenuInteraction;

const [buttons] = autoLoader(join(__dirname, 'button'), { pathTag: ' ', isLog: true });
const [menus] = autoLoader(join(__dirname, 'menu'), { pathTag: ' ', isLog: true });

const buttonComponent = getCommand<MessageButtonInteraction, string>(buttons);
const menuComponent = getCommand<MessageMenuInteraction, string>(menus);

const messageComponent = async (interaction: MessageInteraction) => {
    const {
        custom_id,
        component_type,
        message: { components },
    } = interaction;

    console.log('Component: ', custom_id); // 구버전 이벤트와 병합

    // 이벤트가 발생된 컴포넌트 Row를 가져옵니다.
    interaction.component = components?.find(component =>
        component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
    );

    const id = custom_id.startsWith('4866') ? custom_id.substring(4) : custom_id;

    switch (component_type) {
        case ComponentType.Button:
            const buttonCommand = buttonComponent.find(module => id.startsWith(module[0]));
            if (buttonCommand) {
                const [name, exec] = buttonCommand;

                return await exec(interaction, ...id.substring(name.length + 1).split(' '));
            } else {
                console.log('Component: ', custom_id, 'is not registered.');
                await interaction.reply({ content: '해당 컴포넌트는 등록 하지 않는 컴포넌트 입니다.' });
                return;
            }
            break;
        case ComponentType.StringSelect:
        case ComponentType.ChannelSelect:
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
        case ComponentType.MentionableSelect:
            const menuCommand = menuComponent.find(module => id.startsWith(module[0]));
            if (menuCommand) {
                const [name, exec] = menuCommand;
                return await exec(interaction, ...id.substring(name.length + 1).split(' '));
            } else {
                console.log('Component: ', custom_id, 'is not registered.');
                await interaction.reply({ content: '해당 컴포넌트는 등록 하지 않는 컴포넌트 입니다.' });
                return;
            }
            break;
    }
};

export default messageComponent;
