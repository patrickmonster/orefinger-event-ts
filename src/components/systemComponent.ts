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
import { createQueryKey, orOf, selectQueryKeyPaging } from 'utils/queryKey';

type MenuProps = Omit<APIBaseSelectMenuComponent<ComponentType.StringSelect>, 'type'> & {
    button?: APIButtonComponent;
    isSubQuery?: boolean;
};

/**
 * 신규 쿼리키 생성
 *  - 매뉴를 위한 쿼리키를 생성합니다.
 * @param sql
 * @param params
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentMenuByKey = async (
    menuProps: MenuProps,
    sql: string,
    ...params: any[]
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const key = await createQueryKey({ sql, params, other: JSON.stringify(menuProps) });
    return await selectComponentMenuKey(key);
};

/**
 * 쿼리키로 메뉴 컴포넌트 생성
 *  - 키를 기반으로 검색 매뉴를 생성합니다.
 * @param queryKey 쿼리키
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentMenuKey = async (
    queryKey: string,
    page?: number,
    searchQuery?: orOf // 변경쿼리
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const out = await selectQueryKeyPaging<APISelectMenuOption>(queryKey, { page: page ?? 0, limit: 15 }, searchQuery);
    console.log('SystemComponent] selectComponentMenuByKey', queryKey, out);

    // 키의 보존시간이 만료됨.
    if (!out)
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, style: 1, label: '세션이 만료되었습니다', custom_id: `0`, disabled: true }],
            },
        ];

    if (!out.result.total)
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        style: 1,
                        label: '검색결과가 없습니다.',
                        custom_id: `key back ${queryKey}`,
                        disabled: searchQuery ? false : true,
                    },
                ],
            },
        ];

    const { result, other, search } = out;

    const menuProps: MenuProps = JSON.parse(other);

    return [
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    ...menuProps,
                    type: ComponentType.StringSelect,
                    options: result.list,
                    max_values: (menuProps.max_values || 0) > result.list.length ? result.list.length : menuProps.max_values,
                    min_values: menuProps.min_values || 0,
                },
            ],
        },
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    style: 1,
                    // label: '이전',
                    emoji: { name: '⬅️' },
                    custom_id: result.page == 0 ? queryKey : `key ${result.page - 1} ${queryKey}`,
                    disabled: result.page == 0,
                },
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Success,
                    label: `${result.page}/${result.totalPage}`,
                    custom_id: `key page ${queryKey}`,
                    emoji: { name: '🔍' },
                    disabled: other.isSubQuery ? true : false,
                },
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Secondary,
                    label: '검색 초기화',
                    custom_id: `key back ${queryKey}`,
                    disabled: search && Object.keys(search).length ? false : true,
                },
                {
                    type: ComponentType.Button,
                    style: 1,
                    // label: '다음',
                    emoji: { name: '➡️' },
                    custom_id: `key ${result.page + 1} ${queryKey}`,
                    disabled: result.page >= result.totalPage,
                },
                other.button ? other.button : null,
            ].filter(v => v),
        },
    ];
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// 임베드 템플릿 수정용 컴포넌트

/**
 * 에디터 컴포넌트
 * @param embed_id
 * @returns
 */
export const editerComponent = (base_id: string, buttons: APIButtonComponent[]): APIActionRowComponent<APIMessageActionRowComponent> => {
    return {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: '수정',
                custom_id: `${base_id} edit`,
            },
            {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: '복사',
                custom_id: `${base_id} copy`,
            },
            // { // -- use_yn 으로 대체됨
            //     type: ComponentType.Button,
            //     style: ButtonStyle.Danger,
            //     label: '삭제',
            //     custom_id: `${base_id} delete`,
            // },
            ...buttons,
            // {
            //     type: ComponentType.Button,
            //     style: ButtonStyle.Danger,
            //     label: '테스트',
            //     custom_id: `test`,
            // },
            // {
            //     type: ComponentType.Button,
            //     style: ButtonStyle.Secondary,
            //     label: '취소',
            //     custom_id: `system cancel`,
            // },
        ],
    };
};

/**
 * 에디터 컴포넌트 - 임베드 템플릿용
 * @param embed_id
 * @param skip_footer 푸터를 생략할지 여부 (생략시, 방송알리미로 푸터가 고정됨)
 * @returns
 */
export const editerComponentEmbedTemplate = (base_id: string, skip_footer?: boolean): APIActionRowComponent<APIMessageActionRowComponent> => {
    const options = [
        { label: '타이틀', value: 'title' },
        { label: '설명', value: 'description' },
        { label: '색상', value: 'color' },
        { label: '이미지', value: 'image' },
        { label: '섬네일', value: 'thumbnail' },
        { label: '소유자', value: 'author' },
        { label: '필드', value: 'field' },
    ];

    if (!skip_footer) options.push({ label: '푸터', value: 'footer' });

    return {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.StringSelect,
                custom_id: `${base_id} select`,
                max_values: 1,
                min_values: 1,
                placeholder: '값 변경',
                options,
            },
        ],
    };
};

/**
 * 에디터 컴포넌트 - 컴포넌트 템플릿용
 * @param embed_id
 * @param skip_footer 푸터를 생략할지 여부 (생략시, 방송알리미로 푸터가 고정됨)
 * @returns
 */
export const editerComponentComponentTemplate = (base_id: string): APIActionRowComponent<APIMessageActionRowComponent> => {
    const options = [
        // name / custom_id / value / min_length / max_length
        { label: '기본설정', value: 'base' },
        // label_id
        { label: '텍스트', value: 'text' },
        // use_yn / disabled_yn / style_id / type_id
        { label: '옵션', value: 'type' },
    ];
    return {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.StringSelect,
                custom_id: `${base_id} select`,
                max_values: 1,
                min_values: 1,
                placeholder: '변경',
                options,
            },
        ],
    };
};

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
