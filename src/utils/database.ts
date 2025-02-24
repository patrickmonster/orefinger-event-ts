'use strict';
import { env } from 'process';

import _getConnection, {
    query as _query,
    selectOne as _selectOne,
    selectPaging as _selectPaging,
    selectPersent as _selectPersent,
    createPool,
    Paging,
    Present,
    QueryFunctionType,
    SqlInsertUpdate,
} from 'mysql-rowquery';

export * from 'mysql-rowquery';

export type YN = 'Y' | 'N' | boolean;

const pool = createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    port: Number(env.DB_PORT || 3306),
    password: env.DB_PASSWD,
    database: env.DB_DATABASE,
    connectionLimit: 4, // 연결 개수 제한
});

export const query = <T>(query: string, ...params: any[]) => _query<T>(pool, query, ...params);
export const selectOne = <T>(query: string, ...params: any[]) => _selectOne<T>(pool, query, ...params);
export const selectPaging = <T>(query: string, paging: Paging | number, ...params: any[]) =>
    _selectPaging<T>(pool, query, paging, ...params);
export const selectPersent = <T>(query: string, present: Present, ...params: any[]) =>
    _selectPersent<T>(pool, query, present, ...params);
const getConnection = <T>(connectionPool: (queryFunction: QueryFunctionType) => Promise<T>, isTransaction = false) =>
    _getConnection<T>(pool, connectionPool, isTransaction);

export const upsert = (_query: string, ...params: any[]) => query<SqlInsertUpdate>(_query, ...params);

type Param = string | number | boolean | Date | null;
type Params = { [k: string]: Param };
export const upsertByQuery = (table: string, pk: Params, params: Params) =>
    upsert(
        `
        INSERT INTO ${table} 
        SET ?
        ON DUPLICATE KEY UPDATE ?
    `,
        { ...params, ...pk },
        params
    );

export default getConnection;

export const tastTo = (query: string) => (process.env.NODE_ENV === 'local' ? '' : query);
