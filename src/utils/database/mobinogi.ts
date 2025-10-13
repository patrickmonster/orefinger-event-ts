'use strict';

import { Paging } from 'interfaces/swagger';
import mysql, { RowDataPacket } from 'mysql2/promise';
import getConnection, { paramsToFormat, queryFunctionType, ResqultQuery, SelectPagingResult } from '.';

export const format = mysql.format;

export const DATABASE_NAME = 'mobinogi';

export { paramsToFormat };

///////////////////////////////////////////////////////////////////////////////////////////
export let limit = 10;

export const query = async <E>(query: string, ...params: any[]): Promise<ResqultQuery<E>> =>
    await getConnection(async (c: queryFunctionType) => c(query, ...params), false, DATABASE_NAME);

// 페이징하여 조회
export const selectPaging = async <E>(
    squery: string,
    paging: Paging | number,
    ...params: any[]
): Promise<SelectPagingResult<E>> =>
    getConnection(
        async query => {
            const page = typeof paging == 'number' ? paging : paging.page;
            const size = typeof paging == 'number' ? limit : ((paging.limit || limit) as number);
            const [rows] = await query<(E & RowDataPacket)[]>(`${squery}\nlimit ?, ?`, [
                ...params,
                page <= 0 ? 0 : page * size,
                size,
            ]);
            const cnt = await query<({ total: number } & RowDataPacket)[]>(
                `SELECT COUNT(1) AS total FROM (\n${query}\n) A`,
                params
            ).then(([[rows]]) => rows.total);

            return {
                total: cnt,
                totalPage: Math.ceil(cnt / size) - 1,
                limit: size,
                page,
                list: rows,
            };
        },
        false,
        DATABASE_NAME
    );
