import getConnection from 'utils/database';

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
