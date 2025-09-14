'use strict';

import { Paging } from 'interfaces/swagger';
import mysql, { PoolConnection, RowDataPacket, createPoolCluster } from 'mysql2/promise';
import { env } from 'process';

// Re-export mysql format for convenience
export const format = mysql.format;

export type YN = 'Y' | 'N' | boolean;

// Database connection configuration
const DATABASE_CONFIG = {
    host: env.DB_HOST,
    user: env.DB_USER,
    port: Number(env.DB_PORT || 3306),
    password: env.DB_PASSWD,
    database: env.DB_DATABASE,
    connectionLimit: 4, // 연결 개수 제한
} as const;

export enum DBEnum {
    OREFINGER = 'OREFINGER',
    MOBINOGI = 'MOBINOGI',
}

// Database connection configuration
const poolCluster = createPoolCluster();
poolCluster.add(DBEnum.OREFINGER, DATABASE_CONFIG);
poolCluster.add(DBEnum.MOBINOGI, {
    ...DATABASE_CONFIG,
    database: 'mabinogi',
});
export const DBName = `${env.DB_DB}`;

// Database connection event handlers
poolCluster.on('connection', target => console.log('DB] 연결됨', target));

// Interface definitions
export interface sqlInsertUpdate {
    affectedRows: number;
    changedRows: number;
    insertId: number;
}

export interface BaseTableCols {
    create_at: string;
    update_at: string;
}

// Constants
const newLine = /\n/g;

/**
 * SQL 쿼리를 로깅하는 함수
 * @param query - SQL 쿼리 문자열
 * @param params - 쿼리 매개변수
 * @param rows - 쿼리 결과
 * @returns 원본 rows를 그대로 반환
 */
const sqlLogger = (query: string, params: any[], rows: any[] | any): any => {
    console.log('=======================================================');
    if (env.MASTER_KEY) {
        console.log('SQL] ', mysql.format(query, params).replace(newLine, ' '), ':: \n', JSON.stringify(rows));
    } else {
        console.log('SQL] ', mysql.format(query, params), ':: \n', rows);
    }
    console.log('=======================================================');
    return rows;
};

// 커넥션 쿼리 함수 타입 정의
// select / insert / update / delete
type ResqultQuery<E> = E extends SqlInsertUpdate ? sqlInsertUpdate : Array<E>;
type ResqultPaggingQuery<E> = E extends SqlInsertUpdate
    ? null
    : {
          total: number;
          totalPage: number;
          list: ResqultQuery<E>;
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

// SQL 타입 - insert / update / delete 인 경우 queryFunctionType의 리턴 타입이 sqlInsertUpdate
export type SqlInsertUpdate = SQLType.insert | SQLType.update | SQLType.delete;

/**
 * 쿼리 결과에서 Y/N 문자열을 boolean으로 변환하는 파서
 * @param rows - 쿼리 결과 데이터
 * @returns 변환된 결과
 */
export const resultParser = (rows: any[] | any): any =>
    JSON.parse(
        JSON.stringify(rows, (key, value) => {
            if (typeof value !== 'string') return value;
            if (key.endsWith('_yn')) return value === 'Y';
            if (value === 'Y') return true;
            if (value === 'N') return false;
            return value;
        })
    );

/**
 * 트랜잭션 모드로 데이터베이스 커넥션을 가져옵니다.
 * @param connectionPool - 커넥션을 사용하는 콜백 함수
 * @param isTransaction - 트랜잭션 모드 여부
 * @returns 콜백 함수의 실행 결과
 */
const getConnection = async <T>(
    connectionPool: (queryFunction: queryFunctionType) => Promise<T>,
    isTransaction = false,
    dbName: DBEnum = DBEnum.OREFINGER
): Promise<T> => {
    let connect: PoolConnection | null = null;
    const errorQuerys: { query: string; params: any[] }[] = [];

    try {
        connect = await poolCluster.getConnection(dbName);
        if (isTransaction) await connect.beginTransaction(); // 트랜잭션 시작

        return await connectionPool(async (query: string, ...params: any[]) => {
            try {
                const [rows] = await connect!.query(query, params);
                sqlLogger(query, params, rows);

                return Array.isArray(rows)
                    ? resultParser(rows)
                    : {
                          affectedRows: rows.affectedRows,
                          changedRows: rows.changedRows,
                          insertId: rows.insertId,
                      };
            } catch (error) {
                if (env.DB_HOST === 'localhost') {
                    console.error('SQL]', format(query, params));
                }

                if (!query.includes('IGNORE')) {
                    // 중복키 에러 예외처리
                    if (!isTransaction) {
                        connect!.query('INSERT INTO discord_log.error_sql set `sql` = ?, target = ?', [
                            mysql.format(query, params),
                            env.NODE_ENV || 'dev',
                        ]);
                    } else {
                        errorQuerys.push({ query, params });
                    }
                }
                throw error;
            }
        }).then(async (result: T) => {
            if (isTransaction && connect) await connect.commit(); // 커밋
            return result;
        });
    } catch (error) {
        if (isTransaction && connect) {
            await connect.rollback(); // 롤백

            // 에러 쿼리 로그
            for (const { query, params } of errorQuerys) {
                connect.query('INSERT INTO discord_log.error_sql set `sql` = ?, target = ?', [
                    mysql.format(query, params),
                    env.NODE_ENV || 'dev',
                ]);
            }
        }
        throw error;
    } finally {
        if (connect) connect.release(); // 커넥션 반환
    }
};

export default getConnection;

// 페이징 관련 설정
export let limit = 10;

export interface seleceQueryOption {
    query: string;
    page?: number;
    limit?: number;
}

export interface SelectPagingResult<E> {
    total: number;
    totalPage: number;
    limit: number;
    page: number;
    list: E[];
}

/**
 * 단순 쿼리 실행 함수
 * @param query - SQL 쿼리 문자열
 * @param params - 쿼리 매개변수
 * @returns 쿼리 실행 결과
 */
export const query = async <E>(query: string, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (connectionQuery: queryFunctionType) => connectionQuery(query, ...params));
export const queryTarget = async <E>(target: DBEnum, query: string, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (connectionQuery: queryFunctionType) => connectionQuery(query, ...params), false, target);

/**
 * UPSERT 작업 수행 (INSERT ... ON DUPLICATE KEY UPDATE)
 * @param pkKey - 기본 키 필드명
 * @param params - 데이터 객체
 * @returns UPSERT 결과
 */
export const upsert = async (pkKey: string, params: any): Promise<ResqultQuery<SqlInsertUpdate>> => {
    const { [pkKey]: pk, ...updateParams } = params;

    if (!pk) throw new Error('PK가 없습니다.');

    return await query<SqlInsertUpdate>(`INSERT INTO auth SET ? ON DUPLICATE KEY UPDATE ?`, params, updateParams);
};

/**
 * 페이징 제한값 설정
 * @param newLimit - 새로운 제한값
 */
export const setLimit = (newLimit: number): number => (limit = newLimit);

/**
 * 페이징하여 데이터를 조회합니다.
 * @param query - SQL 쿼리 문자열
 * @param paging - 페이징 정보 (Paging 객체 또는 페이지 번호)
 * @param params - 쿼리 매개변수
 * @returns 페이징된 결과
 */
export const selectPaging = async <E>(
    query: string,
    paging: Paging | number,
    ...params: any[]
): Promise<SelectPagingResult<E>> => {
    let connect: PoolConnection | null = null;
    try {
        connect = await poolCluster.getConnection('OREFINGER');
        const page = typeof paging === 'number' ? paging : paging.page;
        const size = typeof paging === 'number' ? limit : ((paging.limit || limit) as number);

        const [rows] = await connect.query<(E & RowDataPacket)[]>(`${query}\nLIMIT ?, ?`, [
            ...params,
            page <= 0 ? 0 : page * size,
            size,
        ]);

        sqlLogger(query, params, [`${page}/${size}`, ...rows]);

        const countResult = await connect.query<({ total: number } & RowDataPacket)[]>(
            `SELECT COUNT(1) AS total FROM (\n${query}\n) AS subquery`,
            params
        );
        const totalCount = countResult[0][0].total;

        return {
            total: totalCount,
            totalPage: Math.ceil(totalCount / size) - 1,
            limit: size,
            page,
            list: rows,
        };
    } catch (error) {
        console.error('SQL]', error);
        throw error;
    } finally {
        if (connect) connect.release();
    }
};

/**
 * 페이징하여 데이터를 조회합니다.
 * @param query - SQL 쿼리 문자열
 * @param paging - 페이징 정보 (Paging 객체 또는 페이지 번호)
 * @param params - 쿼리 매개변수
 * @returns 페이징된 결과
 */
export const selectTargetPaging = async <E>(
    target: DBEnum,
    query: string,
    paging: Paging | number,
    ...params: any[]
): Promise<SelectPagingResult<E>> => {
    let connect: PoolConnection | null = null;
    try {
        connect = await poolCluster.getConnection(target);
        const page = typeof paging === 'number' ? paging : paging.page;
        const size = typeof paging === 'number' ? limit : ((paging.limit || limit) as number);

        const [rows] = await connect.query<(E & RowDataPacket)[]>(`${query}\nLIMIT ?, ?`, [
            ...params,
            page <= 0 ? 0 : page * size,
            size,
        ]);

        sqlLogger(query, params, [`${page}/${size}`, ...rows]);

        const countResult = await connect.query<({ total: number } & RowDataPacket)[]>(
            `SELECT COUNT(1) AS total FROM (\n${query}\n) AS subquery`,
            params
        );
        const totalCount = countResult[0][0].total;

        return {
            total: totalCount,
            totalPage: Math.ceil(totalCount / size) - 1,
            limit: size,
            page,
            list: rows,
        };
    } catch (error) {
        console.error('SQL]', error);
        throw error;
    } finally {
        if (connect) connect.release();
    }
};

/**
 * 쿼리의 해시키를 생성합니다.
 * @param query - SQL 쿼리 문자열
 * @param params - 쿼리 매개변수
 * @returns 해시값
 */
export const getQueryKey = (query: string, ...params: any[]): number => {
    const queryOrigin = mysql.format(query, params);
    let hash = 0;
    for (let i = 0; i < queryOrigin.length; i++) {
        hash += queryOrigin.charCodeAt(i);
    }
    return hash;
};

/**
 * 조건부 쿼리 생성 (값이 유효한 경우에만 쿼리 포맷)
 * @param query - SQL 쿼리 템플릿
 * @param value - 쿼리에 삽입할 값들
 * @returns 포맷된 쿼리 또는 주석
 */
export const calTo = (query: string, ...value: any[]): string => {
    const validValues = value.filter(v => v != null && v !== undefined && v !== '');
    return validValues.length ? mysql.format(query, value) : '-- calTo';
};

/**
 * LIKE 검색을 위한 조건부 쿼리 생성
 * @param query - SQL 쿼리 템플릿
 * @param value - LIKE 검색에 사용할 값들
 * @returns 포맷된 LIKE 쿼리 또는 주석
 */
export const calLikeTo = (query: string, ...value: any[]): string => {
    const validValues = value.filter(v => v != null && v !== undefined && v !== '');
    return validValues.length
        ? mysql.format(
              query,
              value.map(v => `%${v}%`)
          )
        : '-- calTo';
};

/**
 * 테스트 환경에서만 쿼리를 실행하도록 조건부 처리
 * @param query - SQL 쿼리 문자열
 * @returns 환경에 따른 쿼리 문자열
 */
export const tastTo = (query: string): string => (process.env.NODE_ENV === 'local' ? '' : query);

/**
 * 객체를 AND 조건의 WHERE 절로 변환
 * @param obj - 키-값 쌍을 가진 객체
 * @returns AND 조건으로 연결된 WHERE 절 문자열
 */
export const objectToAndQury = (obj: Record<string, any>): string =>
    Object.keys(obj)
        .map(key => (obj[key] ? `AND ${key} = ${mysql.escape(obj[key])}` : `/* SKIP :: ${key} */`))
        .join('\n');
