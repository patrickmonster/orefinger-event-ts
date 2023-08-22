import { query, queryPaging, SqlInsertUpdate } from 'utils/database';

import { ComponentCreate } from 'interfaces/component';

export const getComponentList = async (page: number) =>
    queryPaging<{
        component_id: number;
        name: string;
        label_id: number;
        label_lang: string;
        type_idx: number;
        text_id: number;
        emoji: string;
        custom_id: string;
        value: string;
        style_id: number;
        min_values: number;
        max_values: number;
        disabled: boolean;
        required: boolean;
        use: boolean;
        edit: boolean;
        permission_type: number;
        create_at: string;
        update_at: string;
        order_by: number;
    }>(
        `
SELECT component_id, name, label_id, label_lang, type_idx, text_id, emoji, custom_id, value, style_id, min_values, max_values, disabled_yn as disabled, required_yn as required, use_yn as \`use\`, edit_yn as edit, permission_type, create_at, update_at, order_by
FROM component`,
        page
    );

export const getComponentDtil = async (component_id: number) =>
    query(
        `
SELECT
  a.component_id,
  a.name,
  a.label_id,
  (SELECT message FROM text_message b where b.text_id = a.label_id) as label,
  a.label_lang,
  a.type_idx,
  c.type,
  c.tag as type_name,
  a.text_id,
  (SELECT message FROM text_message b where b.text_id = a.text_id) as \`text\`,
  a.emoji,
  a.custom_id,
  a.value,
  a.style_id as \`style\`,
  d.tag as style_name,
  a.min_values,
  a.max_values,
  a.disabled_yn as disabled,
  a.required_yn as required,
  a.use_yn as use,
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
        component_id
    );

export const createComponent = async (component: ComponentCreate) => query(`INSERT INTO component set ?`, component);

export const updateComponent = async (component_id: number, component: ComponentCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE component
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        component_id
    );

export const getComponentOptionList = async (page: number) =>
    queryPaging(
        `
SELECT option_id, label, value, description, emoji, default_yn as default, use_yn as use, permission_type, create_at, update_at
FROM component_option
  `,
        page || 0
    );

export const getComponentOptionDtil = async (option_id: number) =>
    query(
        `
SELECT
  option_id,
  label_id,
  (SELECT message FROM text_message b where b.text_id = a.label_id) as label,
  value,
  description_id,
  (SELECT message FROM text_message b where b.text_id = a.description_id) as description,
  emoji,
  default_yn as default,
  use_yn as use,
  permission_type,
  create_at,
  update_at
FROM component_option a
where 1=1
and a.option_id = ?
  `,
        option_id
    );

export const createComponentOption = async (component: ComponentCreate) => query(`INSERT INTO component_option   set ?`, component);

export const updateComponentOption = async (component_id: number, component: ComponentCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE component_option
SET ?, update_at=CURRENT_TIMESTAMP
WHERE component_id=?`,
        component,
        component_id
    );
