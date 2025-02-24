import { config } from 'dotenv';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}
const toSpecialCase_ = (str: string, separator: string) =>
    str
        .split('')
        .map(letter => {
            if (/[-_\s.]/.test(letter)) return separator;
            if (letter.toUpperCase() === letter) return separator + letter.toLowerCase();
            return letter;
        })
        .join('')
        .replace(new RegExp(separator + '+', 'g'), separator)
        .replace(new RegExp('^' + separator), '')
        .replace(new RegExp(separator + '$'), '');

const emptyDirSync = (dir: string) =>
    existsSync(dir)
        ? readdirSync(dir).forEach(item => rmSync(join(dir, item), { recursive: true, force: true }))
        : mkdirSync(dir, { recursive: true });

const toSnakeCase = (str: string) => toSpecialCase_(str, '_');
const toUpperSnakeCase = (str: string) => toSpecialCase_(str, '_').toUpperCase();

const toTableType = (type: string) => {
    switch (type) {
        case 'int':
        case 'bigint':
        case 'tinyint':
        case 'smallint':
        case 'mediumint':
            return 'number';
        case 'varchar':
        case 'char':
        case 'text':
        case 'longtext':
            return 'string';
        case 'datetime':
        case 'timestamp':
            return 'Date';
        default:
            return 'any';
    }
};

////////

import getConnection, { QueryFunctionType } from 'utils/database';

const TARGET_DATABASE = 'sys_orefinger';
const TARGET_PATH = join(env.PWD || __dirname, `/src/interfaces/Database`);

emptyDirSync(join(TARGET_PATH, `/${TARGET_DATABASE}`));

const createTableFile = async (query: QueryFunctionType, table: Table) => {
    const cols = await query<{
        COLUMN_NAME: string;
        ORDINAL_POSITION: number;
        COLUMN_DEFAULT: string;
        IS_NULLABLE: string;
        DATA_TYPE: string;
        CHARACTER_MAXIMUM_LENGTH: number;
        CHARACTER_OCTET_LENGTH: number;
        COLUMN_TYPE: string;
        COLUMN_KEY: string;
        PRIVILEGES: string;
        COLUMN_COMMENT: string;
        LABEL: string;
    }>(
        `
SELECT COLUMN_NAME
	, ORDINAL_POSITION
	, COLUMN_DEFAULT
	, IS_NULLABLE
	, DATA_TYPE
	, CHARACTER_MAXIMUM_LENGTH
	, CHARACTER_OCTET_LENGTH
	, COLUMN_TYPE
	, COLUMN_KEY
	, \`PRIVILEGES\`
	, COLUMN_COMMENT
	, IFNULL(L.text, COLUMN_NAME) AS LABEL
FROM information_schema.COLUMNS T
LEFT JOIN sys_orefinger.label L
 ON T.COLUMN_NAME = L.name 
WHERE 1=1
AND T.TABLE_NAME  = ?
ORDER BY ORDINAL_POSITION
        `,
        table.TABLE_NAME
    );
    const table_name = toUpperSnakeCase(table.TABLE_NAME);

    const out: string[] = [
        '/* AUTO CREATE TABLE INTERFACE :: ' + Date.now() + ' */',
        `/* ${table.TABLE_COMMENT} */`,
        `type COLUMN = ${cols.map(col => `'${col.COLUMN_NAME}'`).join(' | ')};`,
        `const columns : COLUMN[] = [ ${cols.map(col => `'${col.COLUMN_NAME}'`).join(',')} ];`,
        `const pk : COLUMN[] = [ ${cols
            .filter(col => col.COLUMN_KEY === 'PRI')
            .map(col => `'${col.COLUMN_NAME}'`)
            .join(',')} ];`,
        '',
        `export const ${table_name} = '${table.TABLE_NAME}';`,
        `export const TABLE_COLUMNS_${table_name} = columns;`,
        `const WHERE_${table_name} = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\\n\tAND ');`,
        `export const SELECT_${table_name} = (where: COLUMN[], ignoreCols?: COLUMN[]) => \`SELECT \${columns.filter(col => !ignoreCols?.includes(col)).join('\\n\t, ')}FROM ${TARGET_DATABASE}.${table.TABLE_NAME} \\nWHERE \${WHERE_${table_name}(where)}\``,
        `export const INSERT_${table_name} = (data: COLUMN[]) => \` INSERT INTO ${TARGET_DATABASE}.${table_name} SET \${WHERE_${table_name}(data)} \``,
        `export const UPDATE_${table_name} = (data: COLUMN[]) => \` UPDATE ${TARGET_DATABASE}.${table_name} SET \${WHERE_${table_name}(data.filter(col=> !pk.includes(col)))}\``,
        cols.some(col => col.COLUMN_NAME === 'use_yn')
            ? `export const DELETE_${table_name} = \`DELETE FROM ${TARGET_DATABASE}.${table_name}\``
            : `export const DELETE_${table_name} = \`UPDATE ${TARGET_DATABASE}.${table_name} SET use_yn = 'N'\``,
        '',
        `export interface ${table_name} {`,
    ];

    const keyNames: string[] = [];
    for (const { COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_KEY, COLUMN_COMMENT } of cols) {
        if (keyNames.includes(COLUMN_NAME)) continue; // 중복된 키는 무시
        out.push(
            `    ${COLUMN_NAME}: ${toTableType(DATA_TYPE)}${IS_NULLABLE == 'NO' ? '' : '| null'};\t\t/* ${
                COLUMN_KEY ? `KEY(${COLUMN_KEY})` : ''
            } ${DATA_TYPE} - ${COLUMN_COMMENT ? COLUMN_COMMENT : '*'} */`
        );
        keyNames.push(COLUMN_NAME);
    }
    out.push(`}`);

    writeFileSync(join(TARGET_PATH, `/${TARGET_DATABASE}/${table.TABLE_NAME}.ts`), out.join('\n'));
};

interface Table {
    TABLE_NAME: string;
    TABLE_COMMENT: string;
    AUTO_INCREMENT: number;
    TABLE_ROWS: number;
}

getConnection(async query => {
    const tables = await query<Table>(
        `
SELECT 
	T.TABLE_NAME 
	, T.TABLE_COMMENT 
	, T.\`AUTO_INCREMENT\`
	, T.TABLE_ROWS
FROM information_schema.TABLES T
WHERE 1=1
AND TABLE_SCHEMA = ?
AND TABLE_TYPE = 'BASE TABLE'
    `,
        TARGET_DATABASE
    );

    if (tables.length === 0) {
        console.error('테이블이 존재하지 않습니다.');
        return;
    } else {
        mkdirSync(join(TARGET_PATH, `/${TARGET_DATABASE}`), { recursive: true });
    }

    const out = [];

    out.push(
        `/* AUTO CREATE TABLE INTERFACE :: ${Date.now()} */`,
        `export const TABLES = [ '${tables.map(table => table.TABLE_NAME).join("', '")}' ];`,
        `export const TABLES_COUNT = ${tables.length};`
    );

    for (const table of tables) {
        await createTableFile(query, table);
        out.push(`/* ${table.TABLE_COMMENT} */`, `export * from './${TARGET_DATABASE}/${table.TABLE_NAME}';`);
    }

    writeFileSync(join(TARGET_PATH, `./${TARGET_DATABASE}.DATABASE.ts`), out.join('\n'));
}).catch(console.error);
