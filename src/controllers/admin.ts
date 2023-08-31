import { query, queryPaging, SqlInsertUpdate, queryFunctionType, selectPaging } from 'utils/database';

/**
 * 쿼리 에러를 조회합니다.
 *  API 단에서 발생한 에러를 조회합니다.
 * @param query
 * @returns
 */
export const getErrorLogs = async (page: number) =>
    await selectPaging(
        `
select * from error_sql es

    `,
        page
    );
