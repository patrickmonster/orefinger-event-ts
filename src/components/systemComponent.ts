import {
    APIActionRowComponent,
    APIBaseSelectMenuComponent,
    APIButtonComponent,
    APIMessageActionRowComponent,
    APIModalInteractionResponseCallbackData,
    APISelectMenuOption,
    ButtonStyle,
    ComponentType,
    TextInputStyle,
} from 'discord-api-types/v10';
import { createQueryKey, selectQueryKeyPaging } from 'utils/queryKey';

/**
 * 신규 쿼리키 생성
 * @param sql
 * @param params
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentMenuByKey = async (
    menuProps: Omit<APIBaseSelectMenuComponent<ComponentType.StringSelect>, 'type'> & {
        buttons?: APIButtonComponent[];
    },
    sql: string,
    ...params: any[]
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const key = await createQueryKey({ sql, params, other: JSON.stringify(menuProps) });
    return await selectComponentMenuKey(key);
};

/**
 * 쿼리키로 메뉴 컴포넌트 생성
 * @param queryKey 쿼리키
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentMenuKey = async (queryKey: string, page?: number): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const out = await selectQueryKeyPaging<APISelectMenuOption>(queryKey, { page: page ?? 0, limit: 15 });
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
                    custom_id: result.page == 0 ? queryKey : `key ${result.page - 1} ${queryKey}`,
                    disabled: result.page == 0,
                },
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Success,
                    label: `${result.page}/${result.totalPage}`,
                    custom_id: '${queryKey}} ${result.page}',
                    disabled: true,
                },
                {
                    type: ComponentType.Button,
                    style: 1,
                    label: '다음',
                    custom_id: `key ${result.page + 1} ${queryKey}`,
                    disabled: result.page >= result.totalPage,
                },
                ...(other.buttons || []),
            ].slice(0, 5),
        },
    ];
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// 임베드 템플릿 수정용 컴포넌트

enum EmbedEditComponent {
    title = 'title',
    description = 'description',
    color = 'color',
    footer = 'footer',
    image = 'image',
    thumbnail = 'thumbnail',
    author = 'author',
    field = 'field',
}

// 에디트 베이스 모달
export const embedEdit = async (embed_id: string, target: EmbedEditComponent): Promise<APIModalInteractionResponseCallbackData> => {
    switch (target) {
        case EmbedEditComponent.title:
            return {
                custom_id: `embedEdit ${embed_id} ${EmbedEditComponent.title}`,
                title: '제목',
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.TextInput,
                                custom_id: 'title',
                                style: TextInputStyle.Short,
                                label: '제목',
                                max_length: 100,
                                min_length: 1,
                            },
                            {
                                type: ComponentType.TextInput,
                                custom_id: 'url',
                                style: TextInputStyle.Short,
                                label: '링크',
                            },
                        ],
                    },
                ],
            };
        case EmbedEditComponent.description:
            break;
        case EmbedEditComponent.color:
            break;
        case EmbedEditComponent.footer:
            break;
        case EmbedEditComponent.image:
            break;
        case EmbedEditComponent.thumbnail:
            break;
        case EmbedEditComponent.author:
            break;
        case EmbedEditComponent.field:
            break;
    }

    return {
        custom_id: `embedEdit ${embed_id} ${EmbedEditComponent.title}`,
        title: '제목',
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        custom_id: 'title',
                        style: TextInputStyle.Short,
                        label: '제목',
                        max_length: 100,
                        min_length: 1,
                    },
                    {
                        type: ComponentType.TextInput,
                        custom_id: 'url',
                        style: TextInputStyle.Short,
                        label: '링크',
                    },
                ],
            },
        ],
    };
};
