// index.tsx (Bun v1.3 runtime)
import { cors } from 'hono/cors';
import { Hono } from 'hono@4';
import mysql, { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';

export enum SQLType {
    select = 'select',
    insert = 'insert',
    update = 'update',
    delete = 'delete',
}
export type SqlInsertUpdate = SQLType.insert | SQLType.update | SQLType.delete;
export interface SqlInsertUpdateResult {
    affectedRows: number;
    changedRows: number;
    insertId: number;
}

type ResqultQuery<E> = E extends SqlInsertUpdate ? SqlInsertUpdateResult : Array<E>;
type queryFunctionType = <E>(query: string, ...params: unknown[]) => Promise<ResqultQuery<E>>;

const app = new Hono();

if (!process.env.MYSQL_URL) {
    process.exit(1);
}
const pool: Pool = mysql.createPool(process.env.MYSQL_URL);
pool.on('connection', () => console.log('DB] 연결됨'));

export const resultParser = (rows: any): any =>
    JSON.parse(
        JSON.stringify(rows, (k, v) => {
            if (typeof v != 'string') return v;
            if (k.endsWith('_yn')) return v == 'Y' ? true : false;
            if (v == 'Y') return true;
            if (v == 'N') return false;
            return v;
        })
    );

const getConnection = async <T>(connectionPool: (queryFunction: queryFunctionType) => Promise<T>): Promise<T> => {
    let connect: PoolConnection | null = null;
    const sqlStartTime = Date.now();
    try {
        connect = await pool.getConnection();
        return await connectionPool(async (query: string, ...params: any[]) => {
            try {
                const [rows] = await connect!.query(query, params);
                return Array.isArray(rows)
                    ? resultParser(rows)
                    : {
                          affectedRows: (rows as ResultSetHeader).affectedRows,
                          changedRows: (rows as ResultSetHeader).changedRows,
                          insertId: (rows as ResultSetHeader).insertId,
                      };
            } catch (e) {
                if (!query.includes('IGNORE')) {
                    // 중복키 에러 예외처리
                } else throw e;
            }
        });
    } catch (e) {
        throw e;
    } finally {
        if (connect) connect.release(); // 커넥션 반환
        // console.timeEnd('SQL_RUNNING_TIME');
        const sqlEndTime = Date.now();
        console.log(`SQL RUNNING TIME : ${sqlEndTime - sqlStartTime}ms`);
    }
};

app.use('/*', cors());
app.get('/', c => c.text('VERSION 1.0'));
app.get('/tables', async c => {
    const connect = await pool.getConnection();

    return c.json(
        await connect.query(`
SELECT idx
	, label
	, use_yn
FROM api_target
WHERE 1=1
    `)
    );
});

app.get('/api/health', c => c.json({ status: 'ok' }));

Bun.serve({
    port: import.meta.env.PORT ?? 3000,
    fetch: app.fetch,
});
