import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getEmbedList, createEmbed, updateEmbed } from 'controllers/embed';

import { Paging } from 'interfaces/swagger';
import { EmbedCreate } from 'interfaces/embed';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'embed',
        type: 'object',
        description: '임베드',
        nullable: true,
        required: ['tag'],
        properties: {
            tag: { type: 'string', description: '설명' },
            url: { type: 'string', description: 'URL' },
            timestampe: { type: 'boolean', description: '타임스탬프' },
            color: { type: 'number', description: '색상' },
            image: { type: 'string', description: '이미지' },
            thumbnail: { type: 'string', description: '썸네일' },
        },
    });

    fastify.addSchema({
        $id: 'embedAuthor',
        type: 'object',
        description: '작성자',
        nullable: true,
        properties: {
            name: { type: 'string', description: '작성자 이름', nullable: true },
            url: { type: 'string', description: '작성자 URL', nullable: true },
            icon_url: { type: 'string', description: '작성자 아이콘', nullable: true },
        },
    });

    fastify.addSchema({
        $id: 'embedProvider',
        type: 'object',
        description: '제공자',
        nullable: true,
        properties: {
            name: { type: 'string', description: '제공자 이름', nullable: true },
            url: { type: 'string', description: '제공자 URL', nullable: true },
        },
    });

    fastify.addSchema({
        $id: 'embedFooter',
        type: 'object',
        nullable: true,
        properties: {
            text: { type: 'string', description: '푸터 텍스트', nullable: true },
            icon_url: { type: 'string', description: '푸터 아이콘', nullable: true },
        },
    });

    // 임베드 수정용
    const _embedSchema = {
        allOf: [
            { $ref: 'embed#' },
            {
                type: 'object',
                properties: {
                    title_id: { type: 'number' },
                    description_id: { type: 'number' },
                    footer_text: { type: 'string' },
                    footer_icon_url: { type: 'string' },
                    thumbnail: { type: 'string' },
                    provider_name: { type: 'string' },
                    provider_url: { type: 'string' },
                    author_name: { type: 'string' },
                    author_url: { type: 'string' },
                    author_icon_url: { type: 'string' },
                },
            },
        ],
    };

    fastify.get<{
        Querystring: Paging;
    }>(
        '/embed',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['System'],
                description: '임베드 리스트 조회',
                querystring: { $ref: 'paging#' },
            },
        },
        async req => await getEmbedList(req.query.page)
    );

    fastify.post<{
        Body: EmbedCreate;
    }>(
        '/embed',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '임베드 생성',
                tags: ['System'],
                body: _embedSchema,
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await createEmbed(req.body)
    );

    fastify.patch<{
        Body: EmbedCreate;
        Params: { embed_id: number };
    }>(
        '/embed/:embed_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '임베드 생성',
                tags: ['System'],
                params: {
                    type: 'object',
                    properties: {
                        embed_id: { type: 'number' },
                    },
                },
                body: _embedSchema,
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await updateEmbed(req.params.embed_id, req.body)
    );
};
