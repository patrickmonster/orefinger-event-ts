import {
    APIActionRowComponent,
    APIApplicationCommandSubcommandOption,
    APIButtonComponent,
    APIButtonComponentBase,
    APIButtonComponentWithCustomId,
    APIButtonComponentWithURL,
    APIChannelSelectComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    APIModalActionRowComponent,
    APIRoleSelectComponent,
    APISelectMenuComponent,
    APIStringSelectComponent,
    APITextInputComponent,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonStyle,
    ComponentType,
    RESTPostAPIApplicationCommandsJSONBody,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    TextInputStyle,
} from 'discord-api-types/v10';
import { basename } from 'path';
import division from 'utils/division';

type NumberLater<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : NumberLater<N, [...Acc, Acc['length']]>;

export interface MaxList<T, U extends number> extends Array<T> {
    length: NumberLater<U>;
}

export const createEmbed = (embed: APIEmbed): APIEmbed => ({
    ...embed,
    footer: {
        text: 'Create by.뚱이(Patrickmonster)',
        icon_url: 'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
    },
});

export const createActionRow = (
    ...components: MaxList<APIButtonComponent | undefined, 6>
): APIActionRowComponent<APIMessageActionRowComponent> => ({
    type: ComponentType.ActionRow,
    components: components?.filter(v => v) as APIButtonComponent[],
});

export const createButton = (
    custom_id: string,
    props: Omit<
        APIButtonComponentBase<ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger>,
        'type'
    >
): APIButtonComponentWithCustomId => ({
    type: ComponentType.Button,
    custom_id,
    ...props,
});

type ButtomProps<T extends ButtonStyle> = Omit<APIButtonComponentBase<T>, 'type' | 'style' | 'custom_id'>;

export const createUrlButton = (url: string, props: ButtomProps<ButtonStyle.Link>): APIButtonComponentWithURL => ({
    type: ComponentType.Button,
    style: ButtonStyle.Link,
    url,
    ...props,
});

export const getTextSpace = (count: number) =>
    Array.from({ length: count })
        .map(() => '\u200b')
        .join('');

export const appendTextWing = (text: string, count: number) => {
    const wing = getTextSpace(count);
    return `${wing}${text}${wing}`;
};

export const createPrimaryButton = (custom_id: string, props: ButtomProps<ButtonStyle.Primary>) =>
    createButton(custom_id, { style: ButtonStyle.Primary, ...props });
export const createSecondaryButton = (custom_id: string, props: ButtomProps<ButtonStyle.Secondary>) =>
    createButton(custom_id, { style: ButtonStyle.Secondary, ...props });
export const createSuccessButton = (custom_id: string, props: ButtomProps<ButtonStyle.Success>) =>
    createButton(custom_id, { style: ButtonStyle.Success, ...props });
export const createDangerButton = (custom_id: string, props: ButtomProps<ButtonStyle.Danger>) =>
    createButton(custom_id, { style: ButtonStyle.Danger, ...props });

// 버튼을 배열로 만들어주는 함수
export const createButtonArrays = (...buttons: APIButtonComponent[]): APIActionRowComponent<APIButtonComponent>[] =>
    division(buttons, 5)
        .filter(v => v.length)
        .map(buttons => ({
            type: ComponentType.ActionRow,
            components: buttons,
        }));

export const createStringSelectMenu = (
    custom_id: string,
    props: Omit<APIStringSelectComponent, 'type' | 'custom_id'>
): APIActionRowComponent<APISelectMenuComponent> => ({
    type: ComponentType.ActionRow,
    components: [
        {
            type: ComponentType.StringSelect,
            custom_id,
            ...props,
            max_values: props.max_values == 0 ? props.options.length : props.max_values,
        },
    ],
});

export const createRoleSelectMenu = (
    custom_id: string,
    props: Omit<APIRoleSelectComponent, 'type' | 'custom_id'>
): APIActionRowComponent<APISelectMenuComponent> => ({
    type: ComponentType.ActionRow,
    components: [
        {
            type: ComponentType.RoleSelect,
            custom_id,
            ...props,
        },
    ],
});

export const createChannelSelectMenu = (
    custom_id: string,
    props: Omit<APIChannelSelectComponent, 'type' | 'custom_id'>
): APIActionRowComponent<APISelectMenuComponent> => ({
    type: ComponentType.ActionRow,
    components: [
        {
            type: ComponentType.ChannelSelect,
            custom_id,
            ...props,
        },
    ],
});

export const createTextInput = (
    custom_id: string,
    style: TextInputStyle,
    props: Omit<APITextInputComponent, 'type' | 'style' | 'custom_id'>
): APIActionRowComponent<APIModalActionRowComponent> => {
    return {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.TextInput,
                custom_id,
                style,
                ...props,
            },
        ],
    };
};

export const createTextParagraphInput = (
    custom_id: string,
    props: Omit<APITextInputComponent, 'type' | 'style' | 'custom_id'>
) => createTextInput(custom_id, TextInputStyle.Paragraph, props);

export const createTextShortInput = (
    custom_id: string,
    props: Omit<APITextInputComponent, 'type' | 'style' | 'custom_id'>
) => createTextInput(custom_id, TextInputStyle.Short, props);

/////////////////////////////////////////////////////////////
type RESTPostAPIApplicationCommandsJSONBodyNotName = Omit<RESTPostAPIApplicationCommandsJSONBody, 'name'>;

export const createCommand = (options: RESTPostAPIApplicationCommandsJSONBodyNotName, f_name: string) => {
    return {
        ...options,
        name: basename(f_name, f_name.endsWith('js') ? '.js' : '.ts'),
    };
};

export const createChatinputCommand = (
    options: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type' | 'name'>,
    f_name: string
) => {
    return createCommand(
        {
            ...options,
            type: ApplicationCommandType.ChatInput,
        },
        f_name
    );
};

export const createChatinputSubCommand = (
    options: Omit<APIApplicationCommandSubcommandOption, 'type' | 'name'>,
    f_name: string
): APIApplicationCommandSubcommandOption => ({
    ...options,
    type: ApplicationCommandOptionType.Subcommand,
    name: basename(f_name, f_name.endsWith('js') ? '.js' : '.ts'),
});

export type MenuInputType = ApplicationCommandType.Message | ApplicationCommandType.User;
/**
 * 유저 / 메뉴 이벤트
 * @param options
 * @param f_name
 * @returns
 */
export const createMenuinputCommand = (
    options: Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'type' | 'name'>,
    f_name: string
) => {
    return createCommand(
        {
            ...options,
            type: ApplicationCommandType.User,
        },
        f_name
    );
};

export const createToggleButton = (
    isEnable: boolean,
    custom_id: [string, string],
    lable: [string, string]
): APIButtonComponentWithCustomId =>
    !isEnable
        ? createSuccessButton(custom_id[0], { label: lable[0], emoji: { name: '🟢' } })
        : createDangerButton(custom_id[1], { label: lable[1], emoji: { name: '🔴' } });
