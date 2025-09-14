import { getApiTarget, getSystemCols } from 'controllers/component/system';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import camelCase from 'utils/camelCase';
import { format, query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { selectDiscordUser } from 'controllers/auth';
import { Paging } from 'interfaces/swagger';
import { snakeCase } from 'utils/snakeCase';

type ParamsType = {
    [key: string]: string | number | boolean;
};

type YN = boolean;

/**
 * 해당 라우팅은, 자동화된 API를 생성하는 라우팅입니다.
 * 테이블에 대한 CRUD를 자동으로 생성합니다.
 *
 * 주의사항
 *  - SQL 문을 직접적으로 삽입 가능 하기 때문에, SQL 인젝션 공격에 취약합니다.
 */
export default async (fastify: FastifyInstance, opts: any) => {
    const isAdmin = async (request: FastifyRequest, reply: FastifyReply, done: Function) => {
        console.log(`request.user`, request.user);
        const user = await selectDiscordUser(request.user.id);
        if (!user || !user.admin_yn) reply.unauthorized('해당 사용자는 관리자 권한이 없습니다.');
        else done();
    };

    const list = await query<{
        TABLE_NAME: string;
        TABLE_TYPE: string;
        cols: {
            name: string;
            type: string;
            isNull: boolean;
            comment: string;
            default: string | boolean;
            order: number;
            EXTRA: string;
            COLUMN_KEY: 'PRI' | 'MUL' | 'UNI' | '';
        }[];
        TABLE_COMMENT: string;
        description: string;
        select_yn: YN;
        insert_yn: YN;
        update_yn: YN;
    }>(getSystemCols);

    for (const item of list) {
        const { TABLE_NAME, cols, TABLE_COMMENT, description, TABLE_TYPE } = item;

        // console.log(`TABLE_NAME`, TABLE_NAME);
        // console.log(`cols`, cols.map(col => JSON.stringify(col)));
        const keys = cols.filter(col => col.COLUMN_KEY === 'PRI');

        const updateTarget = cols.filter(col => {
            if (col.EXTRA === 'auto_increment') return false;
            if (['create_at', 'update_at', 'use_yn', 'create_user', 'update_user'].includes(col.name)) return false;
            if (col.COLUMN_KEY === 'PRI') return false;

            return true;
        });

        const whereSchema = updateTarget.reduce((acc, col) => {
            acc[col.name] = { type: col.type, description: col.comment };
            if (col.isNull) {
                acc[col.name].nullable = true;
            }
            return acc;
        }, {} as any);

        const insertSchema = updateTarget.reduce((acc, col) => {
            acc[col.name] = { type: col.type, description: col.comment };
            if (col.isNull) {
                acc[col.name].nullable = true;
            }
            if (col.default) {
                acc[col.name].default = col.default;
            }
            return acc;
        }, {} as any);

        const updateSchema = updateTarget.reduce((acc, col) => {
            acc[col.name] = { type: col.type, description: col.comment };
            if (col.isNull) {
                acc[col.name].nullable = true;
            }
            return acc;
        }, {} as any);

        const isCreateUser = cols.find(col => col.name === 'create_user');
        const isUpdateUser = cols.find(col => col.name === 'update_user');

        if (item.select_yn)
            fastify.get<{
                Querystring: Paging &
                    ParamsType & {
                        order_by?: string;
                        order_type?: string;
                    };
            }>(
                `/table/${camelCase(TABLE_NAME)}`,
                {
                    schema: {
                        // hide: true,
                        description: description || `# ${TABLE_NAME} 테이블`,
                        summary: `${TABLE_TYPE == 'VIEW' ? '(가상화)' : ' - '} ${TABLE_COMMENT}`,
                        tags: ['AUTO'],
                        deprecated: false,
                        querystring: {
                            allOf: [
                                { $ref: 'paging#' },
                                {
                                    type: 'object',
                                    properties: whereSchema,
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        order_by: {
                                            type: 'string',
                                            description: `정렬할 컬럼을 지정합니다.`,
                                            enum: cols.map(col => col.name),
                                        },
                                        order_type: {
                                            type: 'string',
                                            description: `정렬할 타입을 지정합니다.`,
                                            enum: ['asc', 'desc'],
                                            default: 'asc',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
                async (req, res) =>
                    await selectPaging(
                        `SELECT ${cols
                            .sort((a, b) => a.order - b.order)
                            .map(col => `A.${col.name} AS \`${camelCase(col.name)}\``)
                            .join('\n   , ')} \nFROM ${TABLE_NAME} A \nWHERE ${
                            Object.keys(req.query)
                                .map(k => {
                                    const col = cols.find(col => snakeCase(k) === col.name);
                                    if (!col) return null;
                                    return /*col?.COLUMN_KEY === 'UNI' &&*/ col?.type === 'string'
                                        ? format(`A.${snakeCase(k)} LIKE ?`, `%${req.query[k]}%`)
                                        : format(`A.${snakeCase(k)} = ?`, req.query[k]);
                                })
                                .filter(k => k) // null 값 제거
                                .join('\n   AND ') || '1=1'
                        }${
                            req.query.order_by
                                ? format(`\nORDER BY A.${snakeCase(req.query.order_by)} ${req.query.order_type}`)
                                : ''
                        } /*AUTO SELECT*/
                        `,
                        req.query
                    )
            );

        if (TABLE_TYPE == 'BASE TABLE') {
            if (item.insert_yn) {
                fastify.post<{
                    Body: ParamsType;
                }>(
                    `/table/${camelCase(TABLE_NAME)}`,
                    {
                        onRequest: [fastify.authenticate],
                        schema: {
                            security: [{ Bearer: [] }],
                            description: description || `# ${TABLE_NAME} 테이블`,
                            summary: `(생성) ${TABLE_COMMENT}`,
                            tags: ['AUTO'],
                            body: {
                                type: 'object',
                                required: updateTarget.filter(col => !col.isNull).map(col => col.name),
                                properties: insertSchema,
                            },
                        },
                    },
                    (req, res) => {
                        try {
                            isAdmin(req, res, async () => {
                                const { insertId } = await query<SqlInsertUpdate>(
                                    `INSERT INTO ${TABLE_NAME} A /*AUTO INSERT*/ \nSET ${
                                        Object.keys(req.body)
                                            .filter(k => whereSchema[k])
                                            .map(k => format(`A.${snakeCase(k)} = ?`, [req.body[k]]))
                                            .join('\n   , ') || '1=1'
                                    }${isCreateUser ? format(`\n    , A.create_user = ?`, req.user.id) : ''}`
                                );
                                res.status(200).send({ result: 'ok', insertId });
                            });
                        } catch (error) {
                            console.log(`error`, error);
                            res.status(500).send({ result: 'error', error });
                        }
                    }
                );
            }
            if (item.update_yn) {
                fastify.patch<{
                    Querystring: ParamsType;
                    Body: ParamsType;
                }>(
                    `/table/${camelCase(TABLE_NAME)}`,
                    {
                        onRequest: [fastify.authenticate],
                        schema: {
                            security: [{ Bearer: [] }],
                            description: description || `# ${TABLE_NAME} 테이블`,
                            summary: `(수정) ${TABLE_COMMENT}`,
                            tags: ['AUTO'],
                            querystring: {
                                type: 'object',
                                required: keys.filter(col => !col.isNull).map(col => col.name),
                                properties: keys.reduce((acc, col) => {
                                    acc[col.name] = { type: col.type, description: col.comment };
                                    if (col.isNull) {
                                        acc[col.name].nullable = true;
                                    }
                                    return acc;
                                }, {} as any),
                            },
                            body: {
                                type: 'object',
                                properties: updateSchema,
                            },
                        },
                    },
                    (req, res) => {
                        try {
                            isAdmin(req, res, async () => {
                                console.log(
                                    `req.query`,
                                    req.query,
                                    Object.keys(req.query).filter(k => whereSchema[k])
                                );
                                console.log(`req.body`, req.body);

                                const { changedRows } = await query<SqlInsertUpdate>(
                                    `UPDATE ${TABLE_NAME} A /*AUTO UPDATE*/ \nSET ${
                                        Object.keys(req.body)
                                            .filter(k => whereSchema[snakeCase(k)])
                                            .map(k => format(`A.${snakeCase(k)} = ?`, [req.body[k]]))
                                            .join('\n   , ') || '1=1'
                                    }${isUpdateUser ? format(`\n, update_user = ?`, req.user.id) : ''}${
                                        isUpdateUser ? format(`\n, update_at = CURRENT_TIMESTAMP`) : ''
                                    }\nWHERE ${
                                        Object.keys(req.query)
                                            .filter(k => keys.find(col => col.name === snakeCase(k)))
                                            .map(k => format(`A.${snakeCase(k)} = ?`, req.query[k]))
                                            .join('\n   AND ') || '1=0' // (모든 항목 업데이트)
                                    }`
                                );
                                res.status(200).send({ result: 'ok', changedRows });
                            });
                        } catch (error) {
                            console.log(`error`, error);
                            res.status(500).send({ result: 'error', error });
                        }
                    }
                );
            }
        }
    } // end for

    fastify.get(
        '/table',
        {
            schema: {
                description: `# 자동화 대상 테이블 목록 입니다.`,
                summary: 'API 자동화 태이블 대상 목록',
                tags: ['AUTO'],
                deprecated: false,
            },
        },
        async (req, res) => await query(getApiTarget)
    );
};
