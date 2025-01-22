import { findLabel, Label, selectLabel, upsertLabel } from 'controllers/system/label';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';

/**
 * 라벨 관리
 * @date 2025-01-10
 */
export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Querystring: {
            label: string[];
            label_lang?: number;
            mapping?: boolean;
        };
    }>(
        '/findLabel',
        {
            // onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '라벨 리스트 조회',
                summary: '라벨 리스트',
                tags: ['System'],
                querystring: {
                    type: 'object',
                    properties: {
                        label: { type: 'array', description: '라벨명', nullable: true },
                        label_lang: { type: 'number', description: '라벨 언어', nullable: true },
                        mapping: { type: 'boolean', description: '매핑여부', nullable: false },
                    },
                },
            },
        },
        async req =>
            await findLabel(req.query.label, req.query.label_lang).then(data =>
                !req.query.mapping
                    ? data
                    : req.query.label.map(label => {
                          const find = data.find(d => d.name === label);
                          return (
                              find || {
                                  name: label,
                                  language_cd: req.query.label_lang || 0,
                                  text: label,
                                  create_at: '',
                                  update_at: '',
                              }
                          );
                      })
            )
    );

    fastify.get<{
        Querystring: Paging & {
            label_lang?: number;
            search?: string;
        };
    }>(
        '/label',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '라벨 리스트 조회',
                summary: '라벨 리스트',
                tags: ['System'],
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                search: { type: 'string', description: '검색어', nullable: true },
                                label_lang: { type: 'number', description: '라벨 언어', nullable: true },
                            },
                        },
                    ],
                },
            },
        },
        async req => await selectLabel(req.query, req.query)
    );

    fastify.post<{
        Body: Label;
    }>(
        '/label',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '라벨 리스트 조회',
                summary: '라벨 리스트',
                tags: ['System'],
                body: {
                    type: 'object',
                    properties: {
                        label: { type: 'string', description: '라벨명', nullable: true },
                        text: { type: 'string', description: '출력명', nullable: true },
                        label_lang: { type: 'number', description: '라벨 언어', nullable: true },
                    },
                },
            },
        },
        async req => upsertLabel(req.body)
    );
};
