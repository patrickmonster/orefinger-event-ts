import getConnection, { query, SqlInsertUpdate, selectPaging, limit, calTo } from 'utils/database';

import { Paging } from 'interfaces/swagger';

export type Post = {
    id: string;
    title: string;
    description: string;
    type: string;
    use_yn: string;
    public_yn: string;
    commant_yn: string;
    create_at: string;
    update_at: string;
    craete_user: string;
    update_user: string;
    bookmark: number;
    like: number;
    bookmark_yn?: string;
    like_yn?: string;
};

export const getPostList = async (paging: Paging, user_id?: string | null, type?: string) =>
    await selectPaging<Post>(
        `
SELECT
    A.id
    , A.title
    , left(A.description, 100) as description
    , A.\`type\`
    , A.use_yn
    , A.public_yn
    , A.commant_yn
    , A.create_at
    , A.update_at
    , A.craete_user
    , A.update_user
    , SUM(CASE WHEN B.bookmark_yn = 'Y' THEN 1 ELSE 0 END) AS bookmark
    , SUM(CASE WHEN B.like_yn = 'Y' THEN 1 ELSE 0 END) AS \`like\`
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.bookmark_yn ELSE NULL END) AS bookmark_yn', user_id)}
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.like_yn ELSE NULL END) AS like_yn', user_id)}
FROM post A
LEFT JOIN post_like B ON A.id = B.id AND B.delete_yn ='N'
WHERE 1 = 1
${calTo('AND A.`type` = ?', type)}
GROUP BY A.id
    `,
        paging
    );

export const getPostDil = async (id: string, user_id?: string) =>
    await getConnection(async query => {
        if (user_id) {
            // user_id 가 있을 경우
        }

        const sql = `
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
    , A.craete_user
    , A.update_user
    , SUM(CASE WHEN B.bookmark_yn = 'Y' THEN 1 ELSE 0 END) AS bookmark
    , SUM(CASE WHEN B.like_yn = 'Y' THEN 1 ELSE 0 END) AS \`like\`
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.bookmark_yn ELSE NULL END) AS bookmark_yn', user_id)}
    ${calTo(', MAX(CASE WHEN B.auth_id = ? THEN B.like_yn ELSE NULL END) AS like_yn', user_id)}
FROM post A
LEFT JOIN post_like B 
    ON A.id = B.id
    AND B.delete_yn ='N'
WHERE 1 = 1
GROUP BY A.id
        `;
    });
