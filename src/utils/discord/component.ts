import {
    APIActionRowComponent,
    APIApplicationCommandSubcommandOption,
    APIButtonComponentBase,
    APIButtonComponentWithCustomId,
    APIButtonComponentWithURL,
    APIChannelSelectComponent,
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

export const createActionRow = (
    ...components: APIMessageActionRowComponent[]
): APIActionRowComponent<APIMessageActionRowComponent> => ({
    type: ComponentType.ActionRow,
    components,
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

export const createPrimaryButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Primary>, 'type' | 'style' | 'custom_id'>
) => createButton(custom_id, { style: ButtonStyle.Primary, ...props });
export const createSecondaryButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Secondary>, 'type' | 'style' | 'custom_id'>
) => createButton(custom_id, { style: ButtonStyle.Secondary, ...props });
export const createSuccessButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Success>, 'type' | 'style' | 'custom_id'>
) => createButton(custom_id, { style: ButtonStyle.Success, ...props });
export const createDangerButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Danger>, 'type' | 'style' | 'custom_id'>
) => createButton(custom_id, { style: ButtonStyle.Danger, ...props });

export const createUrlButton = (
    url: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Link>, 'type' | 'style'>
): APIButtonComponentWithURL => {
    return {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url,
        ...props,
    };
};

// 버튼을 배열로 만들어주는 함수
export const createButtonArrays = (
    ...buttons: APIButtonComponentWithURL[]
): APIActionRowComponent<APIButtonComponentWithCustomId | APIButtonComponentWithURL>[] =>
    division(buttons, 5).map(buttons => ({
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

export const createCommand = (options: RESTPostAPIApplicationCommandsJSONBodyNotName, __fileName: string) => {
    return {
        ...options,
        name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
    };
};

export const createChatinputCommand = (
    options: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type' | 'name'>,
    __fileName: string
) => {
    return createCommand(
        {
            ...options,
            type: ApplicationCommandType.ChatInput,
        },
        __filename
    );
};

export const createChatinputSubCommand = (
    options: Omit<APIApplicationCommandSubcommandOption, 'type' | 'name'>,
    __fileName: string
): APIApplicationCommandSubcommandOption => ({
    ...options,
    type: ApplicationCommandOptionType.Subcommand,
    name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
});

export type MenuInputType = ApplicationCommandType.Message | ApplicationCommandType.User;
/**
 * 유저 / 메뉴 이벤트
 * @param options
 * @param __fileName
 * @returns
 */
export const createMenuinputCommand = (
    options: Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'type' | 'name'>,
    __fileName: string
) => {
    return createCommand(
        {
            ...options,
            type: ApplicationCommandType.User,
        },
        __filename
    );
};
