'use strict';
import { Paging } from 'interfaces/swagger';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { env } from 'process';

export const format = mysql.format;

const pool: Pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    port: Number(env.DB_PORT || 3306),
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

const newLine = /\n/g;

const sqlLogger = (query: string, params: any[], rows: any[] | any) => {
    // if (env.sql_log != 'true') return rows;
    console.log('=======================================================');
    if (env.MASTER_KEY) console.log('SQL] ', mysql.format(query, params).replace(newLine, ' '), '||', JSON.stringify(rows));
    else console.log('SQL] ', mysql.format(query, params), '||', rows);
    console.log('=======================================================');
    return rows;
};

// 커넥션 쿼리 함수
// select / insert / update / delete
type ResqultQuery<E> = E extends SqlInsertUpdate ? sqlInsertUpdate : E[];
type ResqultPaggingQuery<E> = E extends SqlInsertUpdate
    ? null
    : {
          total: number;
          totalPage: number;
          list: E[];
          listCount: number;
          page: number;
      };
export type queryFunctionType = <E>(query: string, ...params: any[]) => Promise<ResqultQuery<E>>;

export enum SQLType {
    select = 'select',
    insert = 'insert',
    update = 'update',
    delete = 'delete',
}

// SQL 타입 - insert / update / delete 인 경우  queryFunctionType 의 리턴 타입이 sqlInsertUpdate
export type SqlInsertUpdate = SQLType.insert | SQLType.update | SQLType.delete;

const getConnection = async <T>(connectionPool: (queryFunction: queryFunctionType) => Promise<T>, isTransaction = false) => {
    let connect: PoolConnection | null = null;
    try {
        connect = await pool.getConnection();
        if (isTransaction) await connect.beginTransaction();
        return await connectionPool(async (query: string, ...params: any[]) => {
            try {
                const [rows] = await connect!.query(query, params);
                sqlLogger(query, params, rows);

                return Array.isArray(rows)
                    ? JSON.parse(
                          JSON.stringify(rows, (k, v) => {
                              if (typeof v != 'string') return v; // TODO: string 이 아닌경우 리턴
                              if (k.endsWith('_yn')) return v == 'Y' ? true : false; // TODO: yn 인경우
                              if (v == 'Y') return true;
                              if (v == 'N') return false;
                              return v;
                          })
                      )
                    : {
                          affectedRows: rows.affectedRows,
                          changedRows: rows.changedRows,
                          insertId: rows.insertId,
                      };
            } catch (e) {
                console.error('SQL]', e);
                connect!.query('INSERT INTO discord_log.error_sql set `sql` = ?, target = ?', [mysql.format(query, params), env.NODE_ENV || 'dev']);
                throw e;
            }
        }).then(async (result: T) => {
            if (isTransaction && connect) await connect.commit();
            return result;
        });
    } catch (e) {
        if (isTransaction && connect) await connect.rollback();
        // console.error('SQL]', e);
        throw e;
    } finally {
        if (connect) connect.release();
    }
};

export default getConnection;
///////////////////////////////////////////////////////////////////////////////////////////
export let limit = 10;

export type seleceQueryOption = {
    query: string;
    page?: number;
    limit?: number;
};

export const query = async <E>(query: string, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (c: queryFunctionType) => c(query, ...params));

export const setLimit = (l: number) => (limit = l);

// 페이징하여 조회
export const selectPaging = async <E>(query: string, paging: Paging | number, ...params: any[]) =>
    await getConnection(async (c: queryFunctionType) => {
        const page = typeof paging == 'number' ? paging : paging.page;
        let size = typeof paging == 'number' ? limit : ((paging.limit || limit) as number);
        const result = await c<E>(`${query}\nlimit ?, ?`, ...params, page <= 0 ? 0 : page * size, size);
        const [{ total }] = await c<{
            total: number;
        }>(
            `
SELECT COUNT(1) AS total FROM (
${query}
) A`,
            ...params
        );

        return {
            total,
            totalPage: Math.ceil(total / size) - 1,
            limit: size,
            page,
            list: result,
        };
    }, true);

export const calTo = (query: string, ...value: any[]) =>
    value.filter(v => v != null && v != undefined && v != '').length ? mysql.format(`${query}`, value) : '-- calTo';
