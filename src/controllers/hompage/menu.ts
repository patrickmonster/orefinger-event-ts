import { query } from 'utils/database';

import { env } from 'process';
/**
 * 쿼리 에러를 조회합니다.
 *  API 단에서 발생한 에러를 조회합니다.
 * @param query
 * @returns
 */
export const selectMenus = async (user_id: string) =>
    await query<{
        menu_idx: number;
        name: string;
        msg: string;
        file_name: string;
    }>(
        `
SELECT menu_idx
	, name
	, sys_orefinger.func_label_message(name,0) AS msg
	, m.file_name
    , m.icon
FROM homepage.menu m
INNER JOIN homepage.menu_permission mp
	USING(menu_idx)
WHERE 1=1
AND ( ? = mp.auth_id OR m.public_yn = 'Y' )
        `, user_id,
    );