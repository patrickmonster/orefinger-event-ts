import { Paging } from 'interfaces/swagger';
import { resultParser, selectPaging } from 'utils/database';
import redis, { REDIS_KEY } from 'utils/redis';

import { format } from 'mysql2';

export type andOf = { [key: string]: any };
export type orOf = { [key: string]: any };

type QueryKeyProps = {
    sql: string;
    params: any[];
    other?: string;
};

const queryRedisSaveingTime = 60 * 60 * 2; // 2시간

/**
 * 쿼리 구조체를 생성합니다.
 * @param queryKey
 * @returns
 */
export const createQueryKey = async (queryKey: QueryKeyProps): Promise<string> => {
    const key = `${new Date().getTime()}`;
    const queryObject = JSON.stringify({ sql: queryKey.sql, params: queryKey.params, other: queryKey.other });

    await redis.set(REDIS_KEY.SQL.SELECT(key), queryObject, { EX: queryRedisSaveingTime });

    return key;
};

/**
 * 쿼리를 OR 조건의 검색 조건으로 변경합니다.
 * @param search
 * @returns
 */
const searchLikeOrQuery = (search: orOf) =>
    Object.keys(search).length
        ? `WHERE ${Object.keys(search)
              .map(key => format(` ${key} LIKE ? \n`, [`%${search[key]}%`]))
              .join('OR')}`
        : '-- no search\n';

/**
 * 페이징 쿼리를 조회합니다.
 * @param queryKey
 * @param page
 * @param search
 * @returns
 */
export const selectQueryKeyPaging = async <E extends {}>(queryKey: string, page: Paging, search?: orOf) => {
    const sql = await redis.get(REDIS_KEY.SQL.SELECT(queryKey));
    if (!sql) return null;

    const { sql: query, params, other, search: searchOrg } = JSON.parse(sql);

    if (search) {
        const cols = Object.keys(search);

        for (const col of cols)
            if (!query.includes(col)) {
                delete search[col];
                console.log('DEBUG :: selectQueryKeyPaging - 컬럼제거', col);
            }
    }

    let runningQuery = query;
    if (search) {
        await redis.set(REDIS_KEY.SQL.SELECT(queryKey), JSON.stringify({ sql: query, params, other, search }), {
            EX: queryRedisSaveingTime,
        });
    }

    // 서브 검색조건이 있는 경우에만 OR 조건을 추가합니다.
    if (search || searchOrg)
        runningQuery = `SELECT  A.* FROM ( ${query}\n) A ${searchLikeOrQuery(search ?? searchOrg)}`;

    return {
        result: resultParser(await selectPaging<E>(runningQuery, page, ...params)),
        other,
        search: search || searchOrg,
    };
};

export default createQueryKey;
