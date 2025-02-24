import getConnection, { calTo, query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { APIEmbed, APIModalInteractionResponseCallbackData } from 'discord-api-types/v10';
import { Embed, EmbedCreate, EmbedUser, UserEmbed } from 'interfaces/embed';

export const selectEmbedList = async (page: number) =>
    selectPaging<Embed>(
        `
select *
from v_embed
        `,
        page
    );

export const selectEmbedDtilByEmbed = async (embed_id: number | string) =>
    query<{ embed: APIEmbed; content: string }>(
        `
SELECT func_get_embed(e.embed_id) AS embed 
    , CONCAT('embed : ' ,IFnull(tag, '지정되지 않음'), ' - ',e.embed_id) AS content
FROM embed e 
WHERE e.embed_id = ?
        `,
        embed_id
    ).then(res => res[0]);

export const selectEmbedUserDtilByEmbed = async (embed_id: number | string) =>
    query<{ embed: APIEmbed; content: string }>(
        `
SELECT veu.embed AS embed 
    , CONCAT('embed : ' ,DATE_FORMAT(veu.create_at, '%y-%m-%d'), ' - ',veu.embed_id) AS content
FROM v_embed_user veu  
WHERE veu.embed_id = ?
        `,
        embed_id
    ).then(res => res[0]);

export const createEmbed = async (message: EmbedCreate) => query(`INSERT INTO embed set ?`, message);

export const updateEmbed = async (embed_id: number, message: EmbedCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE embed
SET ?, update_at=CURRENT_TIMESTAMP
WHERE embed_id=?`,
        message,
        embed_id
    );

export const upsertEmbedUser = async (
    bord: Partial<Omit<EmbedUser, 'embed_id' | 'create_at' | 'update_at'>>,
    pk?: string
) =>
    query<SqlInsertUpdate>(
        pk
            ? `UPDATE embed_user SET ?, update_at=CURRENT_TIMESTAMP WHERE embed_id = ${calTo('?', pk)}`
            : `INSERT INTO embed_user SET ?`,
        bord
    );

// ========================================================================================================
// select component

export const selectEmbedBaseEditByModel = async (embed_id: string) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(a.embed_id, '] 임베드 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'tag', 'label', '제목', 'value', tag, 'min_length', 1, 'max_length', 500, 'style', 1, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'url', 'label', '설명', 'value', IFNULL(url, ''), 'min_length', 0, 'max_length', 1000, 'style', 2, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'color', 'label', '링크', 'value',IFNULL(color, '') , 'min_length', 0, 'max_length', 100, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'image', 'label', '이미지url', 'value',IFNULL(image, '') , 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'thumbnail', 'label', '이미지url', 'value',IFNULL(thumbnail, '') , 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM embed a
WHERE a.embed_id = ?
        `,
        embed_id
    ).then(res => res[0]);

export const selectEmbedUserBaseEditByModel = async (embed_id?: string) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(${calTo('?', embed_id || 0)}, '] 데시보드 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'title', 'label', '제목', 'value', title, 'min_length', 1, 'max_length', 500, 'style', 1, 'required', true )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'description', 'label', '설명', 'value', IFNULL(description, ''), 'min_length', 0, 'max_length', 1000, 'style', 2, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'url', 'label', '링크', 'value',IFNULL(url, '') , 'min_length', 0, 'max_length', 100, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'image', 'label', '이미지url', 'value',IFNULL(image, '') , 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM embed_user a
WHERE a.embed_id = ?
        `,
        embed_id || 1
    ).then(res => res[0]);

export const selectEmbedUserBaseEditByModel2 = async (embed_id?: string) =>
    query<Omit<APIModalInteractionResponseCallbackData, 'custom_id'>>(
        `
SELECT CONCAT(${calTo('?', embed_id || 0)}, '] 임베드 수정') as title,
    JSON_ARRAY(
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'author_name', 'label', '이름(소유자)', 'value', IFNULL(author_name, ''), 'min_length', 0, 'max_length', 100, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'thumbnail', 'label', '우측 이미지', 'value', IFNULL(thumbnail, ''), 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false )
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'author_url', 'label', '링크(소유자)', 'value',IFNULL(author_url, '') , 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false)
            )
        ),
        JSON_OBJECT(
            'type', 1, 'components', JSON_ARRAY(
                JSON_OBJECT('type', 4,'custom_id', 'author_icon_url', 'label', '아이콘 이미지(소유자)', 'value',IFNULL(author_icon_url, '') , 'min_length', 0, 'max_length', 200, 'style', 1, 'required', false)
            )
        )
    ) AS components
FROM embed_user a
WHERE a.embed_id = ?
        `,
        embed_id || 1
    ).then(res => res[0]);

/**
 * 메세지에 포함된 임베드를 조회합니다.
 * @param postId
 * @returns
 */
export const selectPostByEmbedUser = async (postId: string, idx = 1) =>
    getConnection(async query => {
        const embed = query<UserEmbed>(
            `
SELECT
	vmp.post_id
	, vmp.tag
	, CONCAT('mp-', vmue.message_id, '-', vmue.embed_id)  AS hash_id
	, vmp.message_id 
	, vmue.embed_id
	, vmue.message
	, vmue.embed
	, vmp.create_user
	, vmp.update_user
	, vmp.create_at
	, vmp.update_at
FROM v_message_post vmp 
INNER JOIN v_message_user_embed vmue USING(message_id)
WHERE vmp.post = ?
ORDER BY vmp.order ASC
LIMIT ?, 1
        `,
            postId,
            idx - 1
        ).then(res => res[0]);

        const count = query<{
            rownum: number;
            message_id: number;
            use_yn: 'Y' | 'N';
            order: number;
        }>(`
SELECT @rownum := @rownum + 1 AS rownum
	, message_id
	, use_yn
	, \`order\`
FROM message_post_connect mpc, (SELECT @rownum := 0) r
WHERE use_yn = 'Y'
ORDER BY \`order\` ASC
        `);

        return { embed, count };
    });
