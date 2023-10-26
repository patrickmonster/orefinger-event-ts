import { APIMessageButtonInteractionData, APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import { join } from 'path';
import { APIMessageComponentInteraction, ComponentType, IReply } from 'plugins/discord';
import autoLoader from 'utils/autoCommand';

export type MessageButtonInteraction = IReply & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageButtonInteractionData;
export type MessageMenuInteraction = IReply & Omit<APIMessageComponentInteraction, 'data' | 'type'> & APIMessageSelectMenuInteractionData;

export type MessageInteraction = MessageButtonInteraction | MessageMenuInteraction;

type EXEC<E extends IReply> = (interaction: E, ...args: string[]) => Promise<void>;
type ComponentReturnType<E extends IReply> = [string, EXEC<E>];

const [buttons] = autoLoader(join(__dirname, 'button'), { pathTag: ' ', isLog: true });
const [menus] = autoLoader(join(__dirname, 'menu'), { pathTag: ' ', isLog: true });

const getCommand = <E extends IReply>(
    list: {
        name: string;
        pathTag: string;
        path: string[];
        file: string;
    }[]
) =>
    list
        .reduce<ComponentReturnType<E>[]>((prev, { name: fileName, file, path, pathTag }) => {
            const command: {
                name: string;
                default: { alias: string[] | string };
                exec: EXEC<E>;
            } = require(file);

            prev.push([command.name || fileName, command.exec]);

            const aliasList = command?.default?.alias ? (Array.isArray(command.default.alias) ? command.default.alias : [command.default.alias]) : [];
            for (const alias of aliasList) prev.push([[...path, alias].join(pathTag), command.exec]);

            return prev;
        }, [])
        .sort(([a], [b]) => b.length - a.length); // 정렬 (긴것부터 찾도록)

const buttonComponent = getCommand<MessageButtonInteraction>(buttons);
const menuComponent = getCommand<MessageMenuInteraction>(menus);

const messageComponent = async (interaction: MessageInteraction) => {
    const { custom_id, component_type } = interaction;
    const id = custom_id.startsWith('4866') ? custom_id.substring(4) : custom_id;

    console.log('Component: ', custom_id); // 구버전 이벤트와 병합

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
