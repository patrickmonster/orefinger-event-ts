import { APIMessageButtonInteractionData, APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import { join } from 'path';
import { APIMessageComponentInteraction, ComponentType, InteractionEvent } from 'plugins/discord';
import autoLoader from 'utils/autoCommand';

export type MessageButtonInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageButtonInteractionData;
export type MessageMenuInteraction = InteractionEvent & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageSelectMenuInteractionData;

export type MessageInteraction = MessageButtonInteraction | MessageMenuInteraction;

type EXEC<E extends InteractionEvent> = (interaction: E, ...args: string[]) => Promise<void>;
type ComponentReturnType<E extends InteractionEvent> = [string, EXEC<E>];

const [buttons] = autoLoader(join(__dirname, 'button'), { pathTag: ' ', isLog: true });
const [menus] = autoLoader(join(__dirname, 'menu'), { pathTag: ' ', isLog: true });

const getCommand = <E extends InteractionEvent>(
    list: {
        name: string;
        pathTag: string;
        path: string[];
        file: string;
    }[]
) =>
    list
        .reduce<ComponentReturnType<E>[]>((prev, { file, path, pathTag }) => {
            const command: {
                name: string;
                alias: string[];
                exec: EXEC<E>;
            } = require(file);

            for (const alias of command?.alias) prev.push([[...path, alias].join(pathTag), command.exec]);
            prev.push([command.name, command.exec]);
            return prev;
        }, [])
        .sort(([a], [b]) => b.length - a.length); // 정렬 (긴것부터 찾도록)

const buttonComponent = getCommand<MessageButtonInteraction>(buttons);
const menuComponent = getCommand<MessageMenuInteraction>(menus);

const messageComponent = async (interaction: MessageInteraction) => {
    const { custom_id, component_type } = interaction;
    const id = custom_id.startsWith('4866') ? custom_id.substring(4) : custom_id;

    console.log('Component: ', custom_id, interaction); // 구버전 이벤트와 병합
    let command = undefined;

    switch (component_type) {
        case ComponentType.Button:
            const buttonCommand = buttonComponent.find(module => id.startsWith(module[0]));
            if (buttonCommand) {
                const [name, exec] = buttonCommand;
                return await exec(interaction, ...id.replace(new RegExp(name, 'gi'), '').split(' '));
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
                return await exec(interaction, ...id.replace(new RegExp(name, 'gi'), '').split(' '));
            }
            break;
    }
    if (command == undefined) {
        console.log('Component: ', custom_id, 'is not registered.');
        await interaction.re({ content: '해당 컴포넌트는 등록 하지 않는 컴포넌트 입니다.' });
        return;
    }
};

export default messageComponent;
