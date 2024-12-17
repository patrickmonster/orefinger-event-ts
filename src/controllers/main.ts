import getConnection, { query } from 'utils/database';

/**
 * 외부 공개용 api 모음 입니다.
 * @returns
 */

export const getTotal = async () =>
    getConnection(async query => {
        const total = await query<{
            total: number;
        }>(`SELECT COUNT(1) AS total FROM auth`).then(l => l[0].total);

        const list = await query<{
            dd: string;
            count: number;
        }>(`
SELECT 
    at2.auth_type
    , at2.tag 
    , at2.tag_kr 
    , DATE_FORMAT(vat.create_at , "%y-%m-%d") AS create_to
    , COUNT(1) AS counts 
FROM auth_type at2 
INNER JOIN v_auth_token vat
    ON vat.type = at2.auth_type 
    AND vat.create_at > DATE_ADD(NOW(), INTERVAL -10 DAY)
WHERE 1=1
AND (
    at2.use_yn = 'Y'
    OR at2.auth_type = 1
)
GROUP BY create_to, at2.auth_type 
ORDER BY create_to desc 
        `);
        return {
            total,
            list,
        };
    });

export const getUser = async (authId: string) =>
    query<{
        user_id: string;
        name: string;
        kr_name: string;
        avatar: string;
        type_name: string;
        is_session: 'Y' | 'N';
        create_at: string;
        update_at: string;
    }>(
        `
SELECT vat.user_id
	, vat.name
	, vat.kr_name
	, IF (
		vat.type IN (1, 3, 12, 13)
		, vat.avatar
		, null
	) AS avatar
    , at2.tag_kr as type_name
	, vat.is_session
	, vat.create_at
	, vat.update_at 
FROM v_auth_token vat 
LEFT JOIN auth_type at2 ON vat.type = at2.auth_type 
WHERE auth_id = ?
AND vat.use_search_yn = 'Y'
AND vat.type NOT IN (6, 8, 10, 11, 14)
    `,
        authId
    );

export const getHashUrl = async (hashId: string) =>
    query<{ url: string }>(
        `
SELECT
	hash_id
	, id
	, label
	, target_url
FROM link_target lt
WHERE 1=1
AND hash_id = ?
        `,
        hashId
    );
