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

const sqlLogger = (query: string, params: any[], rows: any[] | any) => {
    // if (env.sql_log != 'true') return rows;
    console.log('=======================================================');
    console.log('SQL] ', mysql.format(query, params), rows);
    console.log('=======================================================');
    return rows;
};

type queryFunctionType = <E>(query: string, ...params: any[]) => Promise<E[]>;

const getConnection = async (connectionPool: (queryFunction: queryFunctionType) => Promise<any>): Promise<any> => {
    let connect: PoolConnection | null = null;
    try {
        connect = await pool.getConnection();
        return await connectionPool(
            <E>(query: string, ...params: any[]): Promise<E[]> =>
                connect!
                    .query(query, params)
                    .then(([rows]) => sqlLogger(query, params, rows))
                    .then(data =>
                        JSON.parse(
                            JSON.stringify(data, (k, v) => {
                                if (typeof v != 'string') return v; // TODO: string 이 아닌경우 리턴
                                if (v == 'Y') return true; // TODO: yn 인경우
                                return v;
                            })
                        )
                    )
        );
    } catch (e) {
        console.error('SQL]', e);
    } finally {
        if (connect) connect.release();
    }
};

export default getConnection;

let limit = 30;

export const query = async <E>(query: string, ...params: any[]): Promise<E[]> =>
    await getConnection(async <E>(c: queryFunctionType) => c<E>(query, ...params));

export const setLimit = (l: number) => (limit = l);

export const queryPaging = async <E>(query: string, page: number = 0, ...params: any[]): Promise<E[]> =>
    await getConnection(async <E>(c: queryFunctionType) => {
        if (page <= 0) page = 0;
        return c<E>(`${query}\n order by create_at limit ?, ?`, ...params, page, limit);
    });
