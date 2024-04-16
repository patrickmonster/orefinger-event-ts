import {
    APIActionRowComponent,
    APIBaseSelectMenuComponent,
    APIButtonComponent,
    APIMessageActionRowComponent,
    APISelectMenuOption,
    ComponentType,
} from 'discord-api-types/v10';
import {
    createActionRow,
    createPrimaryButton,
    createSecondaryButton,
    createStringSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';
import createQueryKey, { orOf, selectQueryKeyPaging } from 'utils/queryKey';

type ButtonProps = {
    button?: APIButtonComponent;
};
type MenuProps = Omit<APIBaseSelectMenuComponent<ComponentType.StringSelect>, 'type'> & ButtonProps;
/**
 * 신규 쿼리키 생성
 *  - 매뉴를 위한 쿼리키를 생성합니다.
 * @param sql
 * @param params
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentPagingMenuByKey = async (
    menuProps: MenuProps,
    sql: string,
    ...params: any[]
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const queryKey = await createQueryKey({ sql, params, other: JSON.stringify(menuProps) });
    return await selectComponentPagingMenuKey(queryKey);
};
/**
 * 신규 쿼리키 생성
 *  - 매뉴를 위한 쿼리키를 생성합니다.
 * @param sql
 * @param params
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const createPagingByKey = async <E extends ButtonProps>(other: E, sql: string, ...params: any[]) => {
    const queryKey = await createQueryKey({ sql, params, other: JSON.stringify(other) });
    return await selectPagingKey(queryKey);
};

export const createComponentSelectMenuByComponentPagingMenuByKey = async (
    options: Pick<MenuProps, 'custom_id' | 'placeholder'> & ButtonProps,
    query: string,
    ...params: any[]
) =>
    await selectComponentPagingMenuByKey(
        {
            custom_id: options.custom_id,
            placeholder: options.placeholder,
            button: options.button,
            disabled: false,
            max_values: 1,
            min_values: 1,
        },
        query,
        ...params
    );

/**
 * 쿼리키로 메뉴 컴포넌트 생성
 *  - 키를 기반으로 검색 매뉴를 생성합니다.
 * @param queryKey 쿼리키
 * @param page 페이지
 * @param searchQuery 변경쿼리
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectComponentPagingMenuKey = async (
    queryKey: string,
    page?: number,
    searchQuery?: orOf
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    const {
        component,
        list,
        other: menuProps,
    } = await selectPagingKey<APISelectMenuOption, MenuProps>(queryKey, page, searchQuery);

    if (!list || !list.length || !menuProps) return [component];

    return [
        createStringSelectMenu(menuProps.custom_id, {
            ...menuProps,
            options: list,
            max_values: (menuProps.max_values || 0) > list.length ? list.length : menuProps.max_values,
            min_values: menuProps.min_values || 0,
        }),
        component,
    ];
};
/**
 * 쿼리키로 메뉴 컴포넌트 생성
 *  - 키를 기반으로 검색 매뉴를 생성합니다.
 * @param queryKey 쿼리키
 * @param page 페이지
 * @param searchQuery 변경쿼리
 * @returns APIActionRowComponent<APIMessageActionRowComponent>[]
 */
export const selectPagingKey = async <T extends {}, E extends ButtonProps = {}>(
    queryKey: string,
    page?: number,
    searchQuery?: orOf
): Promise<{
    component: APIActionRowComponent<APIMessageActionRowComponent>;
    other?: E;
    list?: T[];
}> => {
    const resultQuery = await selectQueryKeyPaging<T>(queryKey, { page: page ?? 0, limit: 15 }, searchQuery);

    if (!resultQuery)
        return {
            component: createActionRow(createPrimaryButton(`0`, { label: '세션이 만료되었습니다.', disabled: true })),
        };

    const { result, other, search } = resultQuery;
    const tmpOther = other ? <E>JSON.parse(other) : undefined;

    if (!result.total)
        return {
            list: result.list,
            other: tmpOther,
            component: createActionRow(
                createPrimaryButton(`key back ${queryKey}`, {
                    label: '검색결과가 없습니다.',
                    disabled: searchQuery ? false : true, // 검색결과가 없을때만 비활성화
                }),
                tmpOther?.button
            ),
        };

    return {
        list: result.list,
        other: tmpOther,
        component: createActionRow(
            createPrimaryButton(result.page == 0 ? queryKey : `key ${result.page - 1} ${queryKey}`, {
                emoji: { name: '⬅️' },
                disabled: result.page == 0,
            }),
            createSuccessButton(`key page ${queryKey}`, {
                label: `${result.page}/${result.totalPage}`,
            }),
            createSecondaryButton(`key back ${queryKey}`, {
                emoji: { name: '↩️' },
                disabled: search && Object.keys(search).length ? false : true,
            }),
            createPrimaryButton(`key ${result.page + 1} ${queryKey}`, {
                emoji: { name: '➡️' },
                disabled: result.page >= result.totalPage,
            }),
            tmpOther?.button
        ),
    };
};
// 임베드 템플릿 수정용 컴포넌트

/**
 * 에디터 컴포넌트
 * @param embed_id
 * @returns
 */
export const editerComponent = (
    base_id: string,
    buttons: APIButtonComponent[],
    noCopy?: boolean
): APIActionRowComponent<APIMessageActionRowComponent> => {
    const components = [createPrimaryButton(`${base_id} edit`, { label: '수정' })];

    if (!noCopy) components.push(createPrimaryButton(`${base_id} copy`, { label: '복사' }));

    return {
        type: ComponentType.ActionRow,
        components: [...components, ...buttons],
    };
};

/**
 * 에디터 컴포넌트 - 임베드 템플릿용
 * @param embed_id
 * @param skip_footer 푸터를 생략할지 여부 (생략시, 방송알리미로 푸터가 고정됨)
 * @returns
 */
export const editerComponentEmbedTemplate = (
    base_id: string,
    skip_footer?: boolean
): APIActionRowComponent<APIMessageActionRowComponent> => {
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

    return createStringSelectMenu(`${base_id} select`, {
        max_values: 1,
        min_values: 1,
        placeholder: '값 변경',
        options,
    });
};
