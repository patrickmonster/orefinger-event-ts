import {
    APIActionRowComponent,
    APIBaseSelectMenuComponent,
    APISelectMenuOption,
    APIStringSelectComponent,
    ComponentType,
} from 'discord-api-types/v10';
import division from 'utils/division';

export default (
    menuProps: Omit<APIBaseSelectMenuComponent<ComponentType.StringSelect>, 'type'>,
    ...options: APISelectMenuOption[]
): APIActionRowComponent<APIStringSelectComponent>[] => {
    if (!options.length) return [];

    const menuOptions = division(options, 25);

    const components: APIActionRowComponent<APIStringSelectComponent>[] = [];
    for (const i in menuOptions) {
        const length = menuOptions[i].length;
        if (!length) continue; // 항목이 없는경우
        // 새로운 컴포넌트 생성
        components.push({
            type: ComponentType.ActionRow,
            components: [
                {
                    custom_id: `${menuProps.custom_id} ${i}`,
                    disabled: menuProps.disabled,
                    max_values: (menuProps.max_values || 0) > length ? length : menuProps.max_values,
                    min_values: menuProps.min_values || 0,
                    placeholder: menuProps.placeholder, // 기본 설명
                    type: ComponentType.StringSelect,
                    options: menuOptions[i],
                },
            ],
        });
    }
    return components;
};
