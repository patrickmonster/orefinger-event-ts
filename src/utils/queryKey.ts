import { Paging } from 'interfaces/swagger';
import { resultParser, selectPaging } from 'utils/database';
import redis, { REDIS_KEY } from 'utils/redis';

// import { hash } from 'tweetnacl';
import { format } from 'mysql2';
import sha256 from 'sha256';

const queryTime = 60 * 60 * 2; // 2시간

type QueryKeyProps = {
    sql: string;
    params: any[];
    other?: string;
};

export const createQueryKey = async (queryKey: QueryKeyProps): Promise<string> => {
    // const key = getQueryKey(queryKey.sql, ...queryKey.params, queryKey.other);
    // const key = hash(new TextEncoder().encode(JSON.stringify(queryKey))).reduce((p, c) => p + c.toString(16), '');
    const key = sha256(JSON.stringify(queryKey));

    await redis.set(REDIS_KEY.SQL.SELECT(key), JSON.stringify({ sql: queryKey.sql, params: queryKey.params, other: queryKey.other }), {
        EX: queryTime,
    });

    return key;
};

export type andOf = { [key: string]: any };
export type orOf = { [key: string]: any };

const searchAndQuery = (search: andOf) =>
    Object.keys(search)
        .map(key => format(` ${key} LIKE ? \n`, [`%${search[key]}%`]))
        .join('AND');

const searchOrQuery = (search: orOf) => {
    const keys = Object.keys(search);

    if (!keys.length) return '1=1';

    return keys.map(key => format(` ${key} LIKE ? \n`, [`%${search[key]}%`])).join('OR');
};

export const selectQueryKeyPaging = async <E extends {}>(queryKey: string, page: Paging, search?: orOf) => {
    const sql = await redis.get(REDIS_KEY.SQL.SELECT(queryKey));
    if (!sql) return null;

    const { sql: query, params, other, search: searchOrg } = JSON.parse(sql);

    let runQuery = query;
    if (search) {
        await redis.set(REDIS_KEY.SQL.SELECT(queryKey), JSON.stringify({ sql: query, params, other, search }), {
            EX: queryTime,
        });
    }

    if (search) runQuery = `SELECT  A.* FROM ( ${runQuery}\n) A WHERE ${searchOrQuery(search)}`;
    else if (searchOrg) runQuery = `SELECT  A.* FROM ( ${runQuery}\n) A WHERE ${searchOrQuery(searchOrg)}`;

    const result = await selectPaging<E>(runQuery, page, ...params);
    return { result: resultParser(result), other, search: search || searchOrg };
};
