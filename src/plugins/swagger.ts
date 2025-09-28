'use strict';
import fp from 'fastify-plugin';

import { fastifySwagger } from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';

const { version } = require('../../package.json');

declare module 'fastify' {
    interface FastifyInstance {
        pagingResponse: (properties: { [key: string]: any }) => { [key: string]: any };
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: '방송알리미 API',
                description: `
방송알리미 OpenAPI 문서입니다.

개발자 디스코드 : https://discord.gg/Th3a6JE
        `,
                version,
            },
            tags: [
                /// 버전 관련
                { name: 'Auth', description: '인증' },

                { name: 'Main', description: '매인화면 관련 (캐싱적용) API' },
                // { name: 'WebSocket', description: '웹 소캣' },

                { name: 'Notice', description: '알림' },

                { name: 'Discord', description: '디스코드 관련 API' },

                { name: 'Infra', description: '인프라 설정' },
                { name: 'Admin', description: '관리자 관리용 API' },
                { name: 'System', description: '시스템 관리용 API' },
                { name: 'KakaoBot', description: '카카오 봇 API' },

                { name: 'Util', description: '유틸리티 관련 API' },

                { name: 'Paymont', description: '결제 모듈' },
                { name: 'File', description: '파일서버 (S3)' },
            ],
            // schemes: [process.env.MASTER_KEY ? 'https' : 'http'],
            components: {
                securitySchemes: {
                    Bearer: {
                        type: 'http',
                        scheme: 'bearer',
                    },
                    Master: {
                        type: 'apiKey',
                        name: 'Master',
                        in: 'header',
                    },
                },
            },
            paths: {},
        },
    });

    fastify.register(swagger_ui, {
        routePrefix: '/documentation',
        logo: {
            type: 'image/png',
            content: Buffer.from(
                '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',
                'base64'
            ),
        },
        uiConfig: {
            docExpansion: 'none',
            deepLinking: false,
        },
        transformSpecification: (swaggerObject, request, reply) => swaggerObject,
        transformSpecificationClone: true,
    });

    fastify.addSchema({
        $id: 'sqlResult',
        type: 'object',
        description: '쿼리 결과 (업데이트 / 인서트)',
        nullable: true,
        properties: {
            info: { type: 'string' },
            affectedRows: { type: 'number' },
            fieldCount: { type: 'number' },
            insertId: { type: 'number' },
        },
    });

    fastify.addSchema({
        $id: 'authId',
        type: 'string',
        description: '디스코드 ID',
        minLength: 17,
        maxLength: 20,
    });

    fastify.addSchema({
        $id: 'paging',
        type: 'object',
        description: '페이징',
        properties: {
            page: { type: 'number', description: '페이지 번호', default: 0, minimum: 0 },
            limit: { type: 'number', description: '페이지당 개수', default: 10, minimum: 1, maximum: 100 },
        },
    });

    fastify.decorate('pagingResponse', function (properties: { [key: string]: any }) {
        return {
            200: {
                type: 'object',
                properties: {
                    total: { type: 'number', description: '총 갯수' },
                    totalPage: { type: 'number', description: '총 페이지' },
                    limit: { type: 'number', description: '페이지당 개수' },
                    page: { type: 'number', description: '페이지 번호' },
                    list: {
                        type: 'array',
                        description: '게시글 리스트',
                        items: { type: 'object', properties: properties },
                    },
                },
            },
        };
    });
});
