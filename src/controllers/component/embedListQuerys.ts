import { calTo } from 'utils/database';

/**
 * 해당 문서는, 선택 옵션들을 불러오는 쿼리를 작성하는 문서입니다.
 * 페이징이 가능한 쿼리를 작성하는데 사용됩니다.
 *  - MVC 모델 규칙을 지키기 위하여 작성된 문서 입니다.
 * @patrickmonster
 */

const ComponentActionLowByMenuListQuery = `
SELECT name AS label
    , CAST(car.component_id AS CHAR) AS value
    , IFNULL(
        GROUP_CONCAT(
            car.component_id
            ORDER BY car.sort_number
            SEPARATOR ', '
        ), '없음'
    )  AS description
FROM component_action_row car
LEFT JOIN component_action_row_connect carc 
    ON carc.component_row_id = car.component_id 
    AND carc.use_yn = 'Y'
GROUP BY car.component_id
    `;

const ComponentActionRowConnectionByMenuListQuery = `
SELECT JSON_OBJECT( IF(REGEXP_LIKE(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji)) AS emoji
    , CAST(c.component_id AS CHAR) AS value
    , CONCAT( c.component_id , ']' , name) AS label
    , concat(ct.tag, "] ", name) AS  description
    , IF(carc.use_yn = 'Y', TRUE, FALSE ) AS \`default\`
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx  
LEFT JOIN component_action_row_connect carc ON carc.component_row_id = ? AND carc.component_id = c.component_id AND carc.use_yn ='Y'
    `;

const ComponentByMenuListQuery = `
SELECT json_object( IF(regexp_like(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji)) AS emoji
    , CAST(component_id AS CHAR) AS value
    , CONCAT( component_id , ']' , name) AS label 
    , concat(ct.tag, "] ", name) AS  description
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx
    `;

const ComponentOptionByMenuListQuery = `
SELECT json_object( IF(regexp_like(emoji, '^[0-9]+$'), 'id', 'name'), IF(emoji < '' OR emoji IS NULL, '▫', emoji)) AS emoji
    , CAST(option_id  AS CHAR) AS value
    , label AS label
    , LEFT(CONCAT(value, '] ', description), 100)  AS description 
FROM component_option co 
    `;

const ComponentOptionConnectionByMenuListQuery = `
SELECT json_object( IF(regexp_like(co.emoji, '^[0-9]+$'), 'id', 'name'), IF( co.emoji < '' OR co.emoji IS NULL, '▫', co.emoji)) AS emoji
    , CAST(co.option_id AS CHAR) AS value
    , IF(co.label_id IS NULL, label, f_get_text(co.label_id)) AS label
    , LEFT(IF(co.description_id IS NULL, co.description, f_get_text(co.description_id)), 100) AS description
    , IF(coc.use_yn = 'Y', TRUE, FALSE) AS \`default\`
FROM component_option co
LEFT JOIN component_option_connection coc ON coc.option_id = co.option_id AND coc.embed_id = ?
    `;

const ComponentTypeByMenuListQuery = `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(type_idx AS CHAR) AS value
    , CONCAT( code, '] ', tag) AS label
FROM component_type ct
    `;

const ComponentStyleByMenuListQuery = `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(style_idx  AS CHAR) AS value
    , tag AS label
FROM component_style cs  
    `;

const EmbedByMenuListQuery = `
SELECT CAST(embed_id  AS CHAR) AS value
    , IFNULL(tag, '지정되지 않음')  AS label
FROM embed e
    `;

const EmbedUserByMenuListQuery = (user_id?: string) => `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(embed_id  AS CHAR) AS value
    , title  AS label
FROM embed_user eu
WHERE 1=1
${calTo('AND create_user = ?', user_id)}
    `;

// auth_type
const AuthTypeByMenuListQuery = `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
,  CAST(auth_type AS CHAR) AS value
, CONCAT(tag, '] ',tag_kr) AS label
FROM auth_type at2 
    `;

const SelectAuthDashbord = `
SELECT
    json_object( 'name', IF( ab.use_yn = 'Y', '🔴','⚫')) AS emoji
    ,  CAST(auth_type AS CHAR) AS value
    , CONCAT(tag, '] ',tag_kr) AS label
FROM auth_type at2
left JOIN ( select * from auth_bord ab WHERE ab.guild_id = ? ) ab ON at2.auth_type = ab.type
WHERE 1=1
AND at2.use_yn = 'Y' 
`;

const SelectAuthDashbordNotice = `
SELECT
    json_object( 'name', IF( IFNULL(vnc.use_yn, 'N') = 'Y', '🔴','⚫')) AS emoji
    ,  CAST(ab.\`type\` AS CHAR) AS value
    , tag_kr AS label
    , tag AS description
FROM auth_bord ab
LEFT JOIN auth_type at2 ON ab.\`type\` = at2.auth_type 
LEFT JOIN v_notice_channel vnc ON vnc.notice_id = ab.\`type\` AND vnc.guild_id = ab.guild_id
WHERE ab.guild_id  = ?
AND ab.use_yn = 'Y'
    `;

/**
 * 라벨을 선택하는 쿼리를 작성합니다.
 *  -
 * @param subQuery
 * @param params
 * @returns
 */
const TextMessageDefaultByMenuListQuery = (subQuery?: string, ...params: any[]) => `
SELECT CAST(a.text_id AS CHAR) AS value
    , a.tag AS label
    , LEFT(a.message, 100) AS description
    ${calTo(`, IF(a.text_id = ( ${subQuery} ), true, false) AS \`default\``, ...params)}
FROM text_message a
WHERE parent_id IS NULL 
    `;

const TextMessageByMenuListQuery = TextMessageDefaultByMenuListQuery();

export default {
    ComponentActionLowByMenuListQuery,
    ComponentActionRowConnectionByMenuListQuery,
    ComponentByMenuListQuery,
    ComponentOptionByMenuListQuery,
    ComponentOptionConnectionByMenuListQuery,
    ComponentTypeByMenuListQuery,
    ComponentStyleByMenuListQuery,
    EmbedByMenuListQuery,
    EmbedUserByMenuListQuery,

    AuthTypeByMenuListQuery,

    TextMessageByMenuListQuery,
    TextMessageDefaultByMenuListQuery,

    SelectAuthDashbord,
    SelectAuthDashbordNotice,
};
