'use strict';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { env } from 'process';

const pool: Pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWD,
    database: env.DB_DATABASE,
    connectionLimit: 4, // 연결 개수 제한
});

export const DBName = `${env.DB_DB}`;

pool.on('connection', () => console.log('DB] 연결됨'));

export interface sqlInsertUpdate {
    affectedRows: number;
    changedRows: number;
    insertId: number;
}

const sqlLogger = (query: string, params: any[], rows: any[] | any) => {
    // if (env.sql_log != 'true') return rows;
    console.log('=======================================================');
    console.log('SQL] ', mysql.format(query, params), rows);
    console.log('=======================================================');
    return rows;
};

// 커넥션 쿼리 함수
// select / insert / update / delete
type ResqultQuery<E> = E extends SqlInsertUpdate ? sqlInsertUpdate : E[];
type queryFunctionType = <E>(query: string, ...params: any[]) => Promise<ResqultQuery<E>>;

export enum SQLType {
    select = 'select',
    insert = 'insert',
    update = 'update',
    delete = 'delete',
}

// SQL 타입 - insert / update / delete 인 경우  queryFunctionType 의 리턴 타입이 sqlInsertUpdate
export type SqlInsertUpdate = SQLType.insert | SQLType.update | SQLType.delete;

const getConnection = async <T>(connectionPool: (queryFunction: queryFunctionType) => Promise<T>) => {
    let connect: PoolConnection | null = null;
    try {
        connect = await pool.getConnection();
        return await connectionPool(async (query: string, ...params: any[]) => {
            const [rows] = await connect!.query(query, params);
            sqlLogger(query, params, rows);

            return Array.isArray(rows)
                ? JSON.parse(
                      JSON.stringify(rows, (k, v) => {
                          if (typeof v != 'string') return v; // TODO: string 이 아닌경우 리턴
                          if (v == 'Y') return true; // TODO: yn 인경우
                          return v;
                      })
                  )
                : {
                      affectedRows: rows.affectedRows,
                      changedRows: rows.changedRows,
                      insertId: rows.insertId,
                  };
        });
    } catch (e) {
        console.error('SQL]', e);
        throw e;
    } finally {
        if (connect) connect.release();
    }
};

export default getConnection;
///////////////////////////////////////////////////////////////////////////////////////////
let limit = 10;

export const query = async <E>(query: string, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (c: queryFunctionType) => c(query, ...params));

export const setLimit = (l: number) => (limit = l);

export const queryPaging = async <E>(query: string, page: number = 0, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (c: queryFunctionType) => c(`${query}\n order by create_at limit ?, ?`, ...params, page <= 0 ? 0 : page, limit));
