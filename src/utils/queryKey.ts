import { Paging } from 'interfaces/swagger';
import { selectPaging } from 'utils/database';
import redis, { QueryKey, REDIS_KEY } from 'utils/redis';

// import { hash } from 'tweetnacl';
import sha256 from 'sha256';

type QueryKeyProps = {
    sql: string;
    params: any[];
    other?: string;
};

export const createQueryKey = async (queryKey: QueryKeyProps): Promise<QueryKey> => {
    // const key = getQueryKey(queryKey.sql, ...queryKey.params, queryKey.other);
    // const key = hash(new TextEncoder().encode(JSON.stringify(queryKey))).reduce((p, c) => p + c.toString(16), '');
    const key = sha256(JSON.stringify(queryKey));

    await redis.set(REDIS_KEY.SQL.SELECT(key), JSON.stringify({ sql: queryKey.sql, params: queryKey.params, other: queryKey.other }), {
        EX: 60 * 60 * 24,
    });

    return key;
};

export const selectQueryKeyPaging = async <E extends {}>(queryKey: QueryKey, page: Paging) => {
    const sql = await redis.get(REDIS_KEY.SQL.SELECT(queryKey));
    if (!sql) return null;
    const { sql: query, params, other } = JSON.parse(sql);

    const result = await selectPaging<E>(query, page, ...params);

    return { result, other };
};
