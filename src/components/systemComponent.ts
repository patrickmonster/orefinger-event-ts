import {
    APIActionRowComponent,
    APIBaseSelectMenuComponent,
    APIMessageActionRowComponent,
    APISelectMenuOption,
    ComponentType,
} from 'discord-api-types/v10';
import { createQueryKey, selectQueryKeyPaging } from 'utils/queryKey';
import { QueryKey } from 'utils/redis';

/**
 * 신규 리스트 선택 매뉴 생성
 * @param sql
 * @param params
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentMenuByKey = async (
    menuProps: Omit<APIBaseSelectMenuComponent<ComponentType.StringSelect>, 'type'> & { button_id: string },
    sql: string,
    ...params: any[]
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const limit = 15;
    const key = await createQueryKey({ sql, params, other: JSON.stringify(menuProps) });
    const out = await selectQueryKeyPaging<APISelectMenuOption>(key, { page: 0, limit });

    console.log('SystemComponent] selectComponentMenuByKey', key, out);
    if (!out || !out.result.list.length) return [];

    const { result, other } = out;
    /*

    */
    return [
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    ...JSON.parse(other),
                    type: ComponentType.StringSelect,
                    options: result.list,
                },
            ],
        },
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    style: 1,
                    label: '이전',
                    custom_id: `${menuProps.button_id} ${result.page - 1}`,
                    disabled: result.page != 0,
                },
                {
                    type: ComponentType.Button,
                    style: 1,
                    label: '다음',
                    custom_id: `${menuProps.button_id} ${result.page + 1}`,
                    disabled: result.page >= result.totalPage - 1,
                },
            ],
        },
    ];
};

/**
 *
 * @param queryKey
 */
export const selectComponentMenuKey = async (queryKey: QueryKey) => {
    //
};
