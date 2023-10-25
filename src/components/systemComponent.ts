import {
    APIActionRowComponent,
    APIBaseSelectMenuComponent,
    APIMessageActionRowComponent,
    APISelectMenuOption,
    ComponentType,
} from 'discord-api-types/v10';
import { createQueryKey, selectQueryKeyPaging } from 'utils/queryKey';

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
    const key = await createQueryKey({ sql, params, other: JSON.stringify(menuProps) });
    return await selectComponentMenuKey(key);
};

/**
 *
 * @param queryKey
 */
export const selectComponentMenuKey = async (queryKey: string): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const out = await selectQueryKeyPaging<APISelectMenuOption>(queryKey, { page: 0, limit: 15 });
    console.log('SystemComponent] selectComponentMenuByKey', queryKey, out);

    // 키의 보존시간이 만료됨.
    if (!out || !out.result.list.length)
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, style: 1, label: '세션이 만료되었습니다', custom_id: `0`, disabled: true }],
            },
        ];

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
                    custom_id: `${other.button_id} ${result.page - 1} ${queryKey}`,
                    disabled: result.page != 0,
                },
                {
                    type: ComponentType.Button,
                    style: 1,
                    label: '다음',
                    custom_id: `${other.button_id} ${result.page + 1} ${queryKey}`,
                    disabled: result.page >= result.totalPage - 1,
                },
            ],
        },
    ];
};
