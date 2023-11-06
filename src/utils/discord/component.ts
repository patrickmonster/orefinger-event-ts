import {
    APIActionRowComponent,
    APIButtonComponentBase,
    APIButtonComponentWithCustomId,
    APIButtonComponentWithURL,
    APIModalActionRowComponent,
    APITextInputComponent,
    ButtonStyle,
    ComponentType,
    TextInputStyle,
} from 'discord-api-types/v10';

export const createButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger>, 'type'>
): APIButtonComponentWithCustomId => ({
    type: ComponentType.Button,
    custom_id,
    ...props,
});

export const createPrimaryButton = (custom_id: string, props: Omit<APIButtonComponentBase<ButtonStyle.Primary>, 'type' | 'style' | 'custom_id'>) =>
    createButton(custom_id, { style: ButtonStyle.Primary, ...props });
export const createSecondaryButton = (
    custom_id: string,
    props: Omit<APIButtonComponentBase<ButtonStyle.Secondary>, 'type' | 'style' | 'custom_id'>
) => createButton(custom_id, { style: ButtonStyle.Secondary, ...props });
export const createSuccessButton = (custom_id: string, props: Omit<APIButtonComponentBase<ButtonStyle.Success>, 'type' | 'style' | 'custom_id'>) =>
    createButton(custom_id, { style: ButtonStyle.Success, ...props });
export const createDangerButton = (custom_id: string, props: Omit<APIButtonComponentBase<ButtonStyle.Danger>, 'type' | 'style' | 'custom_id'>) =>
    createButton(custom_id, { style: ButtonStyle.Danger, ...props });

export const createUrlButton = (url: string, props: Omit<APIButtonComponentBase<ButtonStyle.Link>, 'type' | 'style'>): APIButtonComponentWithURL => {
    return {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url,
        ...props,
    };
};

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

export const createTextParagraphInput = (custom_id: string, props: Omit<APITextInputComponent, 'type' | 'style' | 'custom_id'>) =>
    createTextInput(custom_id, TextInputStyle.Paragraph, props);

export const createTextShortInput = (custom_id: string, props: Omit<APITextInputComponent, 'type' | 'style' | 'custom_id'>) =>
    createTextInput(custom_id, TextInputStyle.Short, props);
