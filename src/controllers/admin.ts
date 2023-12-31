import { selectPaging } from 'utils/database';

import { env } from 'process';
/**
 * 쿼리 에러를 조회합니다.
 *  API 단에서 발생한 에러를 조회합니다.
 * @param query
 * @returns
 */
export const selectErrorLogs = async (page: number) =>
    await selectPaging(
        `
select * from error_sql es
where target = ?
    `,
        page,
        env.NODE_ENV || 'dev'
    );
