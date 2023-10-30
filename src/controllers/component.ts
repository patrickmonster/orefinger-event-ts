import getConnection, { SqlInsertUpdate, YN, calTo, query, selectPaging } from 'utils/database';

import { APIEmbed, APIModalInteractionResponseCallbackData, APISelectMenuOption } from 'discord-api-types/v10';
import { ComponentCreate, ComponentOptionCreate } from 'interfaces/component';
import { Paging } from 'interfaces/swagger';

export type ComponentId = number | string;

export const ParseInt = (id: ComponentId) => (typeof id == 'string' ? parseInt(id) : id);

export type Component = {
    component_id: number;
    name: string;
    label_id: number;
    label_lang: string;
    type_idx: number;
    type: string;
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

export const getComponentList = async (page: Paging) =>
    selectPaging<
        Component & {
            label: string;
            text: string;
        }
    >(
        `
SELECT c.component_id
    , c.name
    , c.label
    , c.label_lang
    , c.type_idx
    , ct.tag AS \`type\`
    , c.text_id
    , c.emoji
    , c.custom_id
    , c.value
    , c.\`style\`
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
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx`,
        page
    );

export const getComponentDtil = async (component_id: ComponentId) =>
    query<Component>(
        `
SELECT
  a.component_id,
  a.name,
  a.label_id,
  f_get_text(label_id) as label,
  a.label_lang,
  a.type_idx,
  c.type,
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
FROM component a
left join component_type c on a.type_idx = c.type_idx 
left join component_style d on a.style_id = d.style_idx 
where 1=1
and a.component_id = ?
    `,
        ParseInt(component_id)
    ).then(res => res[0]);

export const getComponentDtilByEmbed = async (component_id: ComponentId) =>
    query<{ embed: APIEmbed; type: number }>(
        `
SELECT 
    JSON_OBJECT(
        'title', IFNULL(IF(label_id IS NULL, label, f_get_text(label_id)), 'title' ),
        'author', JSON_OBJECT('name', c.tag),
        'description', CONCAT(
            'value :', IFNULL(value, '-') , '\n',
            'custom_id :', IFNULL(custom_id, '-') , '\n',
            '비활성/필수 :', IFNULL(disabled_yn, 'N'), '/', IFNULL(required_yn, 'N')  
        ),
        'fields', JSON_ARRAY( 
            JSON_OBJECT('name', 'emoji','value', IFNULL(emoji, '없음'), 'inline', true),
            JSON_OBJECT('name', 'style','value', IFNULL(d.tag, '없음'), 'inline', true),
            JSON_OBJECT('name', 'range','value', CONCAT(IFNULL(min_values, '-') , '/', IFNULL(max_values, '-')), 'inline', false)
        ),
        'footer', JSON_OBJECT('text', name),
        'timestamp', a.create_at 
    ) AS embed
    , c.type_idx as type
FROM component a
LEFT JOIN component_type c ON a.type_idx = c.type_idx 
LEFT JOIN component_style d ON a.style_id = d.style_idx AND d.use_yn ='Y'
WHERE a.component_id = ?
        `,
        ParseInt(component_id)
    ).then(res => res[0]);

export const getComponentBaseEditByModel = async (component_id: ComponentId) =>
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
FROM component a
WHERE a.component_id = ?
        `,
        ParseInt(component_id)
    ).then(res => res[0]);

export const createComponent = async (component: ComponentCreate) => query(`INSERT INTO component set ?`, component);

export const updateComponent = async (component_id: ComponentId, component: Partial<ComponentCreate>) =>
    query<SqlInsertUpdate>(
        `
UPDATE component
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        ParseInt(component_id)
    );

export type UpdateYNConnection = {
    option_id: ComponentId;
    value: YN;
};

export const updateComponentOptionConnect = async (component_id: ComponentId, updates: UpdateYNConnection[]) =>
    getConnection(async query => {
        for (const update of updates) {
            const { option_id, value } = update;

            await query(
                `INSERT INTO component_option_connection SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP
            `,
                {
                    component_id: ParseInt(component_id),
                    option_id,
                    use_yn: value,
                },
                {
                    use_yn: value,
                }
            );
        }
    });

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
FROM component_option
  `,
        page
    );

export const getComponentOptionDtil = async (option_id: number) =>
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
FROM component_option a
where 1=1
and a.option_id = ?
  `,
        option_id
    ).then(res => res[0]);

export const createComponentOption = async (component: ComponentOptionCreate) => query(`INSERT INTO component_option   set ?`, component);

export const updateComponentOption = async (component_id: ComponentId, component: ComponentOptionCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE component_option
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        ParseInt(component_id)
    );

export const getComponentStyleList = async () =>
    query<APISelectMenuOption>(
        `
SELECT style_idx AS label
	, CAST(tag AS CHAR) AS value
FROM component_style cs 
WHERE use_yn = 'Y'
       `
    );

export const getComponentTypeList = async (select_item?: string | number) =>
    query<APISelectMenuOption>(
        `
SELECT CAST(ct.type AS CHAR) AS value
    , tag AS label
    ${calTo(', IF(ct.type = ?, true, false) AS `default`', select_item)}
FROM component_type ct  
WHERE use_yn = 'Y'
       `
    );

export const getComponentYnMenu = async (component_id: ComponentId) =>
    getConnection(async query => {
        const list = await query<{ column_name: string }>(`
SELECT COLUMN_NAME as column_name 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'discord'
AND TABLE_NAME = 'component'
AND COLUMN_NAME LIKE '%_yn'        
        `);

        if (!list.length) return [];
        const [options] = await query<{ options: APISelectMenuOption[] }>(
            `
SELECT JSON_ARRAY(
    ${list
        .map(
            ({ column_name }) => `JSON_OBJECT('label', '${column_name}', 'value', '${column_name}', 'default', IF(${column_name} = 'Y', TRUE, FALSE))`
        )
        .join(',')})AS \`options\`
FROM component c
WHERE c.component_id = ?
            `,
            ParseInt(component_id)
        );

        return options.options;
    });
