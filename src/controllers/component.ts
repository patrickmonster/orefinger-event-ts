import getConnection, { SqlInsertUpdate, YN, calTo, query, selectPaging, tastTo } from 'utils/database';

import {
    APIActionRowComponent,
    APIButtonComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    APIModalInteractionResponseCallbackData,
    APISelectMenuOption,
    ComponentType,
} from 'discord-api-types/v10';
import {
    ComponentActionRow,
    ComponentActionRowConnect,
    ComponentCreate,
    ComponentOptionConnect,
    ComponentOptionCreate,
} from 'interfaces/component';
import { Paging } from 'interfaces/swagger';
import { ParseInt } from 'utils/object';

export type ComponentId = number | string;

export type Component = {
    component_id: number;
    name: string;
    label_id: number;
    type: number;
    type_name: string;
    text_id: number;
    emoji: string;
    custom_id: string;
    value: string;
    style: number;
    style_name: string;
    min_values: number;
    max_values: number;
    disabled: boolean;
    required: boolean;
    use_yn: boolean;
    edit: boolean;
    permission_type: string;
    create_at: string;
    update_at: string;
    order_by: number;
};

export const selectComponentList = async (page: Paging) =>
    selectPaging<
        Component & {
            label: string;
            text: string;
        }
    >(
        `
SELECT c.component_id
    , c.name
    , c.type_idx
    , ct.tag AS \`type\`
    , c.text_id
    , c.emoji
    , c.custom_id
    , c.value
    , c.style_id AS \`style\`
    , c.min_values
    , c.max_values
    , c.disabled_yn
    , c.required_yn
    , c.use_yn
    , c.edit_yn
    , c.permission_type
    , c.create_at
    , c.update_at
    , c.order_by
    , c.label_id
    , c.style_id
FROM sys_orefinger.component c
LEFT JOIN sys_orefinger.component_type ct ON c.type_idx = ct.type_idx`,
        page
    );

export const selectComponentDtil = async (component_id: ComponentId) =>
    query<Component>(
        `
SELECT
  a.component_id,
  a.name,
  a.label_id,
  f_get_text(label_id) as label,
  a.type_idx AS \`type\`,
  c.tag as type_name,
  a.text_id,
  f_get_text(text_id) as \`text\`,
  a.emoji,
  a.custom_id,
  a.value,
  a.style_id as \`style\`,
  d.tag as style_name,
  a.min_values,
  a.max_values,
  a.disabled_yn as disabled,
  a.required_yn as required,
  a.use_yn as \`use\`,
  a.edit_yn as edit,
  a.permission_type,
  a.create_at,
  a.update_at,
  a.order_by
FROM sys_orefinger.component a
left join sys_orefinger.component_type c on a.type_idx = c.type_idx
left join sys_orefinger.component_style d on a.style_id = d.style_id
where 1=1
and a.component_id = ?
    `,
        ParseInt(component_id)
    ).then(res => res[0]);

export const getComponentOptionList = async (page: Paging) =>
    selectPaging<{
        option_id: number;
        label: string;
        value: string;
        description: string;
        emoji: string;
        default: boolean;
        use_yn: boolean;
        permission_type: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT 
    option_id
    , if (label_id is null, label, f_get_text(label_id) ) as label
    , value
    , if (description_id is null, description, f_get_text(description_id) ) as description
    , emoji
    , default_yn
    , use_yn
    , permission_type
    , create_at
    , update_at
FROM sys_orefinger.component_option
  `,
        page
    );

export const selectComponentOptionDtil = async (option_id: number) =>
    query(
        `
SELECT
    option_id,
    label_id,
    f_get_text(label_id) as label,
    value,
    description_id,
    f_get_text(description_id) as description,
    emoji,
    default_yn as \`default\`,
    use_yn as \`use\`,
    permission_type,
    create_at,
    update_at
FROM sys_orefinger.component_option a
where 1=1
and a.option_id = ?
      `,
        option_id
    ).then(res => res[0]);
export const selectComponentStyleList = async () =>
    query<APISelectMenuOption>(
        `
SELECT style_idx AS label
    , CAST(tag AS CHAR) AS value
FROM component_style cs 
${tastTo("WHERE use_yn = 'Y'")}
           `
    );

export const selectComponentTypeList = async (component_id?: ComponentId) =>
    query<APISelectMenuOption>(
        `
SELECT CAST(ct.type AS CHAR) AS value
    , CONCAT(ct.type, ']', tag) AS label
    ${calTo(
        ', IF(ct.type = ( SELECT type_idx FROM sys_orefinger.component c WHERE c.component_id = ? ), true, false) AS `default`',
        component_id
    )}
FROM sys_orefinger.component_type ct  
${tastTo("WHERE use_yn = 'Y'")}
           `
    );

// ========================================================================================================
// select embed
/**
 * 컴포넌트 디테일 정보를 Embde 형태로 반환합니다.
 * @param component_id
 * @returns
 */
export const selectComponentDtilByEmbed = async (component_id: ComponentId) =>
    query<{ embed: APIEmbed }>(
        `
SELECT 
    JSON_OBJECT(
        'title', IFNULL(IF(label_id IS NULL, label, f_get_text(label_id)), '라벨이 없습니다.' ),
        'author', JSON_OBJECT('name', c.tag),
        'description', CONCAT(
            'value :', IFNULL(value, '-') , '\n',
            'custom_id :', IFNULL(custom_id, '-') , '\n'
            -- , '비활성/필수 :', IFNULL(disabled_yn, 'N'), '/', IFNULL(required_yn, 'N')  
        ),
        'fields', JSON_ARRAY( 
            JSON_OBJECT('name', 'emoji','value', IFNULL(emoji, '없음'), 'inline', true),
            JSON_OBJECT('name', 'style','value', IFNULL(d.tag, '없음'), 'inline', true),
            JSON_OBJECT('name', 'range','value', CONCAT(IFNULL(min_values, '-') , '/', IFNULL(max_values, '-')), 'inline', false)
        ),
        'footer', JSON_OBJECT('text', name),
        'timestamp', a.create_at 
    ) AS embed
FROM sys_orefinger.component a
LEFT JOIN sys_orefinger.component_type c ON a.type_idx = c.type_idx 
LEFT JOIN sys_orefinger.component_style d ON a.style_id = d.style_idx 
    ${tastTo("AND use_yn = 'Y'")}
WHERE a.component_id = ?
        `,
        ParseInt(component_id)
    ).then(res => res[0].embed);

/**
 * 컴포넌트 상위 그룹 상세를 Embed 형태로 반환합니다.
 * @param component_id
 * @returns
 */
export const selectComponentConnectGroupDtilByEmbed = async (component_group_id: ComponentId) =>
    query<{ embed: APIEmbed }>(
        `
SELECT 
    JSON_OBJECT(
        'title', IFNULL(cg.name, "없음"),
        'author', JSON_OBJECT('name', IFNULL(c.tag, '없음')),
        'timestamp', cg.create_at 
    ) AS embed
FROM sys_orefinger.component_group cg
LEFT JOIN sys_orefinger.component_type c ON cg.type_idx = c.type_idx 
WHERE cg.group_id = ?
        `,
        ParseInt(component_group_id)
    ).then(res => res[0].embed);

/**
 * 컴포넌트 상위 그룹 상세를 Embed 형태로 반환합니다.
 * @param component_id
 * @returns
 */
export const selectComponentRowDtilByEmbed = async (component_group_id: ComponentId) =>
    query<{ embed: APIEmbed }>(
        `
SELECT JSON_OBJECT(
        'title', IFNULL(car.name, '없음'),
        'timestamp', car.create_at,
        'description', GROUP_CONCAT(
            IFNULL((SELECT tag FROM component_type ct WHERE ct.type_idx= c.type_idx), '-'), ']',
            IFNULL(c.name, '이름이 지정되지 않음'), ' -> ',
            IF(emoji IS NULL ,'', CONCAT(' [',emoji, '] ')),
            IFNULL(IF(label_id IS NULL OR label_id > '', label, f_get_text(label_id)), 'title' )
            ORDER BY car.sort_number
            SEPARATOR '\n'
        )
    ) AS embed
FROM (
    SELECT  car.component_id AS component_row_id
        , car.name
        , car.create_at
        , carc.component_id
        , carc.sort_number
    FROM sys_orefinger.component_action_row car
    LEFT JOIN sys_orefinger.component_action_row_connect carc 
        ON carc.component_row_id = car.component_id 
        ${tastTo("AND carc.use_yn = 'Y'")}
    WHERE car.component_id = ?
    ORDER BY carc.sort_number 
    LIMIT 10
) car
LEFT JOIN sys_orefinger.component c ON c.component_id = car.component_id 
GROUP BY car.component_row_id 
        `,
        ParseInt(component_group_id)
    ).then(res => res[0].embed);

// ========================================================================================================
// select component

export const selectComponentBaseEditByModel = async (component_id: ComponentId) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(a.component_id, '] 컴포넌트 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '이름', 'value', CAST(name AS CHAR), 'min_length', 1, 'max_length', 100, 'style', 1, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'custom_id', 'label', '아이디', 'value', IFNULL(custom_id, ''), 'min_length', 0, 'max_length', 100, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'value', 'label', '값', 'value',IFNULL(value, '') , 'min_length', 0, 'max_length', 100, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'min_values', 'label', '최소값', 'value',IF(min_values IS null, '', CAST(min_values AS CHAR)), 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'max_values', 'label', '최대값', 'value',IF(max_values  IS null, '', CAST(max_values AS CHAR)), 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM sys_orefinger.component a
WHERE a.component_id = ?
        `,
        ParseInt(component_id)
    ).then(res => res[0]);

export const selectComponentGroupEditByModel = async (group_id: ComponentId) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(group_id , '] 컴포넌트 그룹 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '이름', 'value', CAST(name AS CHAR), 'min_length', 1, 'max_length', 100, 'style', 1, 'required', true )
            )
        )
    ) AS components
FROM sys_orefinger.component_group cg 
WHERE group_id = ?
        `,
        ParseInt(group_id)
    ).then(res => res[0]);

export const selectComponentActionRowEditByModel = async (action_row_id: ComponentId) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(component_id , '] 컴포넌트 그룹 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'name', 'label', '이름', 'value', CAST(name AS CHAR), 'min_length', 1, 'max_length', 100, 'style', 1, 'required', true )
            )
        )
    ) AS components
FROM sys_orefinger.component_action_row 
WHERE sys_orefinger.component_id = ? 
        `,
        ParseInt(action_row_id)
    ).then(res => res[0]);

const YNMenu = {
    component: 'component_id',
    component_option: 'option_id',
};

export const selectComponentYnMenu = async (component_id: ComponentId, targetTable: 'component' | 'component_option') =>
    getConnection(async query => {
        const list = await query<{ column_name: string }>(
            `
SELECT COLUMN_NAME as column_name 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'discord'
AND TABLE_NAME = ?
AND COLUMN_NAME LIKE '%_yn'        
        `,
            targetTable
        );

        if (!list.length) return [];
        const [options] = await query<{ options: APISelectMenuOption[] }>(
            `
SELECT JSON_ARRAY(
    ${list
        .map(
            ({ column_name }) =>
                `JSON_OBJECT('label', '${column_name}', 'value', '${column_name}', 'default', IF(${column_name} = 'Y', TRUE, FALSE))`
        )
        .join(',')})AS \`options\`
FROM sys_orefinger.${targetTable} c
WHERE c.${YNMenu[targetTable]} = ?
            `,
            ParseInt(component_id)
        );

        return options.options;
    });

export const selectComponentRowEditByOrder = async (
    component_row_id: ComponentId,
    button_base_id: string
): Promise<APIActionRowComponent<APIMessageActionRowComponent>> =>
    query<{ component: APIButtonComponent }>(
        `
SELECT JSON_OBJECT(
        'type', 2, 'style', 1,
        'label', c.name, 'custom_id', concat(?, ' ', c.component_id),
        'emoji', JSON_OBJECT( IF(REGEXP_LIKE(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji))
    ) AS component
FROM (
    SELECT c.*
    FROM component_action_row_connect carc 
    LEFT JOIN component c ON c.component_id = carc.component_id 
    WHERE component_row_id = ?
    ${tastTo("AND carc.use_yn = 'Y'")}
) c
LIMIT 5
    `,
        button_base_id,
        ParseInt(component_row_id)
    ).then(res => ({
        type: ComponentType.ActionRow,
        components: res.map(({ component }) => component),
    }));

// ========================================================================================================

export const updateComponent = async (component_id: ComponentId, component: Partial<ComponentCreate>) =>
    query<SqlInsertUpdate>(
        `
UPDATE sys_orefinger.component
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        ParseInt(component_id)
    );

export type UpdateYNConnection = {
    option_id: ComponentId;
    value: YN;
};

export const updateComponentOption = async (component_id: ComponentId, component: ComponentOptionCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE sys_orefinger.component_option
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        ParseInt(component_id)
    );

export const updateComponentActionRow = async (component_id: ComponentId, component: ComponentActionRow) =>
    query<SqlInsertUpdate>(
        `UPDATE sys_orefinger.component_action_row SET ?, update_at=CURRENT_TIMESTAMP WHERE component_id = ?`,
        component,
        ParseInt(component_id)
    );

export const updateComponentActionRowConnect = async (
    component_row_id: ComponentId,
    component_id: ComponentId | null,
    component: Partial<ComponentActionRowConnect>
) =>
    query<SqlInsertUpdate>(
        `UPDATE sys_orefinger.component_action_row_connect SET ?, update_at=CURRENT_TIMESTAMP WHERE component_row_id = ? ${calTo(
            'AND component_id = ?',
            component_id
        )}`,
        component,
        ParseInt(component_row_id)
    );

// ========================================================================================================

/**
 * 생성 or 수정 - 컴포넌트
 * @param component
 * @param component_id
 * @returns
 */
export const upsertComponent = async (
    component: Partial<Omit<Component, 'component_id'>>,
    component_id?: ComponentId
) =>
    query<SqlInsertUpdate>(
        component_id
            ? `UPDATE sys_orefinger.component SET ?, update_at=CURRENT_TIMESTAMP WHERE component_id = ${calTo(
                  '?',
                  component_id
              )}`
            : `INSERT INTO sys_orefinger.component SET ?`,
        component
    );

/**
 * 생성 or 수정
 * @param component
 * @param component_id
 * @returns
 */
export const upsertComponentActionRow = async (component: Partial<ComponentActionRow>, component_id?: ComponentId) =>
    query<SqlInsertUpdate>(
        component_id
            ? `UPDATE sys_orefinger.component_action_row SET ?, update_at=CURRENT_TIMESTAMP WHERE component_id = ${calTo(
                  '?',
                  component_id
              )}`
            : `INSERT INTO sys_orefinger.component_action_row SET ?`,
        component
    );

/**
 * 생성 or 수정 - 컴포넌트 하위 연결
 * @param component
 * @param component_id
 * @returns
 */
export const upsertComponentActionRowConnect = async (
    components: ComponentActionRowConnect | ComponentActionRowConnect[]
) =>
    getConnection(async query => {
        const out = {
            affectedRows: 0,
            changedRows: 0,
            insertId: [] as number[],
        };
        if (Array.isArray(components)) {
            for (const component of components) {
                const { affectedRows, changedRows, insertId } = await query<SqlInsertUpdate>(
                    `INSERT INTO sys_orefinger.component_action_row_connect SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
                    component,
                    component
                );
                out.affectedRows += affectedRows;
                out.changedRows += changedRows;
                out.insertId.push(insertId);
            }
        } else {
            const { affectedRows, changedRows, insertId } = await query<SqlInsertUpdate>(
                `INSERT INTO sys_orefinger.component_action_row_connect SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
                components,
                components
            );

            out.affectedRows += affectedRows;
            out.changedRows += changedRows;
            out.insertId.push(insertId);
        }

        return out;
    });

/**
 * 생성 or 수정 - 컴포넌트 옵션 하위 연결
 * @param component
 * @param component_id
 * @returns
 */
export const upsertComponentOptionConnect = async (components: ComponentOptionConnect | ComponentOptionConnect[]) =>
    getConnection(async query => {
        const out = {
            affectedRows: 0,
            changedRows: 0,
            insertId: [] as number[],
        };
        if (Array.isArray(components)) {
            for (const component of components) {
                const { affectedRows, changedRows, insertId } = await query<SqlInsertUpdate>(
                    `INSERT INTO sys_orefinger.component_option_connection SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
                    component,
                    component
                );
                out.affectedRows += affectedRows;
                out.changedRows += changedRows;
                out.insertId.push(insertId);
            }
        } else {
            const { affectedRows, changedRows, insertId } = await query<SqlInsertUpdate>(
                `INSERT INTO sys_orefinger.component_option_connection SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
                components,
                components
            );

            out.affectedRows += affectedRows;
            out.changedRows += changedRows;
            out.insertId.push(insertId);
        }

        return out;
    });

// ========================================================================================================

/**
 * 컴포넌트 생성
 * @param component
 * @returns
 */
export const createComponent = async (component: ComponentCreate) =>
    query<SqlInsertUpdate>(`INSERT INTO sys_orefinger.component SET ?`, component);

/**
 * 컴포넌트 옵션 생성
 * @param component
 * @returns
 */
export const createComponentOption = async (component: ComponentOptionCreate) =>
    query<SqlInsertUpdate>(`INSERT INTO sys_orefinger.component_option   SET ?`, component);

// ========================================================================================================

/**
 * 컴포넌트 복사
 * @param component_id
 * @returns
 */
export const copyComponent = async (component_id: ComponentId) =>
    query<SqlInsertUpdate>(
        `
INSERT INTO sys_orefinger.component (name, label_id, label_lang, type_idx, text_id, emoji, custom_id, value, \`style\`, min_values, max_values, disabled_yn, required_yn, use_yn, edit_yn, permission_type, order_by)
SELECT name, label_id, label_lang, type_idx, text_id, emoji, custom_id, value, \`style\`, min_values, max_values, disabled_yn, required_yn, use_yn, edit_yn, permission_type, order_by 
FROM sys_orefinger.component
WHERE component_id = ?
    `,
        ParseInt(component_id)
    );

/**
 * 컴포넌트 그룹 복사
 * @param component_id
 * @returns
 */
export const copyComponentGroup = async (component_group_id: ComponentId) =>
    query<SqlInsertUpdate>(
        `
INSERT INTO sys_orefinger.component_group (name, group_type, type_idx) 
SELECT name, group_type, type_idx
FROM sys_orefinger.component_group cg 
WHERE group_id = ? 
    `,
        ParseInt(component_group_id)
    );

/**
 * 컴포넌트 ActionRow 복사
 * @param component_id
 * @returns
 */
export const copyComponentActionRow = async (component_action_row_id: ComponentId) =>
    query<SqlInsertUpdate>(
        `
INSERT INTO (name, component_id_0, component_id_1, component_id_2, component_id_3, component_id_4)
SELECT name, component_id_0, component_id_1, component_id_2, component_id_3, component_id_4 
FROM sys_orefinger.component_action_row car 
WHERE sys_orefinger.component_id  = ?
    `,
        ParseInt(component_action_row_id)
    );
