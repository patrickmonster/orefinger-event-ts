import getConnection, { SqlInsertUpdate, calTo, query, selectPaging } from 'utils/database';

import { Paging } from 'interfaces/swagger';

export type Post = {
    id: string;
    title: string;
    description: string;
    type: string;
    use_yn?: string;
    public_yn?: string;
    commant_yn?: string;
    create_at: string;
    update_at: string;
    create_user: string;
    update_user: string;
    bookmark: number;
    like: number;
    bookmark_yn?: string;
    like_yn?: string;
};

export type Commant = {
    parent_id?: string;
    message: string;
    post_id: string;
};

export const getPostTypes = async () =>
    await query<{
        type_id: string;
        tag: string;
    }>(`
select type_id, tag 
from post_type pt 
WHERE 1=1
and list_yn ='Y'    
`);

type PostTypeParams = {
    user_id?: string;
    type?: string;
};
export const selectPostList = async (paging: Paging, props?: PostTypeParams) =>
    await selectPaging<Post>(
        `
SELECT
    A.id
    , A.title
    , left(A.description, 100) as description
    , D.tag AS \`type\`
    , A.use_yn
    , A.public_yn
    , A.commant_yn
    , A.create_at
    , A.update_at
    , IFNULL(C.name,  A.create_user) AS user_name 
    , A.create_user
    , A.update_user
    , SUM(CASE WHEN B.bookmark_yn = 'Y' THEN 1 ELSE 0 END) AS bookmark
    , SUM(CASE WHEN B.like_yn = 'Y' THEN 1 ELSE 0 END) AS \`like\`
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.bookmark_yn ELSE NULL END) AS bookmark_yn', props?.user_id)}
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.like_yn ELSE NULL END) AS like_yn', props?.user_id)}
    ${calTo(", ( SELECT 'Y' FROM post_like pl WHERE pl.id = A.id AND pl.auth_id = ? ) AS view_yn", props?.user_id)}
FROM post A
LEFT JOIN post_like B ON A.id = B.id AND B.delete_yn ='N'
LEFT JOIN auth C ON C.auth_id = A.create_user  
LEFT JOIN post_type D ON A.type = D.type_id 
WHERE 1 = 1
${calTo('AND A.`type` = ?', props?.type)}
AND A.use_yn = 'Y'
AND D.list_yn = 'Y'
GROUP BY A.id
ORDER BY create_at DESC
    `,
        paging
    );

export const getCommantList = async (id: string, paging: Paging) =>
    await selectPaging(
        `
WITH RECURSIVE cte AS (
    SELECT 
        0 AS pos,
        id,
        0 AS parent_id,
        CAST(id AS char(255)) AS _path,
        message,
        post_id,
        use_yn,
        create_user,
        create_at,
        update_at
    FROM commant 
    WHERE parent_id IS NULL AND post_id = ?
    UNION ALL
    SELECT 
        pos + 1,
        c.id,
        c.parent_id,
        concat(_path, '>', c.parent_id) AS _path,
        c.message,
        c.post_id,
        c.use_yn,
        c.create_user,
        c.create_at,
        c.update_at
    FROM commant c
    JOIN cte ON c.parent_id = cte.id
    WHERE c.post_id = ?
)
SELECT pos
    , c.id
    , if(c.use_yn = 'N', '삭제된 덧글 입니다.', c.message) AS message
    , c.use_yn
    , c.create_at
    , c.update_at
    , a.auth_id
    , a.name
    , a.tag
    , IF(a.avatar IS NOT NULL, concat('https://cdn.discordapp.com/avatars/', a.auth_id, '/', a.avatar, '.png'), null ) AS avatar
FROM cte c
LEFT JOIN auth a ON c.create_user = a.auth_id 
ORDER BY _path, create_at
    `,
        paging,
        id,
        id
    );

export const getPostDil = async (id: string, user_id?: string) =>
    await getConnection(async query => {
        if (user_id) {
            // user_id 가 있을 경우
            await query<SqlInsertUpdate>(`INSERT IGNORE INTO post_like set ? `, {
                id,
                auth_id: user_id,
            });
        }

        return query<{
            id: string;
            title: string;
            description: string;
            type: string;
            use_yn: boolean;
            public_yn: boolean;
            commant_yn: boolean;
            create_at: string;
            update_at: string;
            create_user: string;
            update_user: string;
            views: number;
            bookmark: number;
            like: number;
            bookmark_yn?: string;
            like_yn?: string;
            user_name: string;
            avatar?: string;
        }>(
            `
SELECT
    A.id
    , A.title
    , A.description
    , A.\`type\`
    , A.use_yn
    , A.public_yn
    , A.commant_yn
    , A.create_at
    , A.update_at
    , IFNULL(C.name,  A.create_user) AS user_name 
    , IF(C.avatar IS NOT NULL, concat('https://cdn.discordapp.com/avatars/', C.auth_id, '/', C.avatar, '.png'), null ) AS avatar
    , A.create_user
    , A.update_user
    , SUM(1) AS views
    , SUM(CASE WHEN B.bookmark_yn = 'Y' THEN 1 ELSE 0 END) AS bookmark
    , SUM(CASE WHEN B.like_yn = 'Y' THEN 1 ELSE 0 END) AS \`like\`
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.bookmark_yn ELSE NULL END) AS bookmark_yn', user_id)}
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.like_yn ELSE NULL END) AS like_yn', user_id)}
FROM post A
LEFT JOIN post_like B ON A.id = B.id AND B.delete_yn ='N'
LEFT JOIN auth C ON C.auth_id = A.create_user  
WHERE 1 = 1
AND A.id = ?
GROUP BY A.id
        `,
            id
        ).then(rows => rows[0]);
    });

export const postPost = async (auth_id: string, data: Pick<Post, 'title' | 'description' | 'type' | 'use_yn' | 'public_yn' | 'commant_yn'>) =>
    await query<SqlInsertUpdate>(`INSERT INTO post set ?, create_user = ?`, data, auth_id);

export const commantPost = async (auth_id: string, data: Commant) =>
    await query<SqlInsertUpdate>(`INSERT INTO commant set ?, create_user = ?`, data, auth_id);
