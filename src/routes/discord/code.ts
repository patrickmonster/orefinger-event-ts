import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord from 'utils/discordApiInstance';
import { rolePermission } from 'controllers/code';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Querystring: {
            showAll: boolean;
        };
    }>(
        '/code/permission',
        {
            // onRequest: [fastify.authenticate],
            schema: {
                // security: [{ Bearer: [] }],
                description: '역할 권한 목록 조회',
                summary: '역할 권한 목록 조회',
                tags: ['Discord'],
                deprecated: false,
                querystring: {
                    showAll: { type: 'boolean', default: false, description: '모든 권한 조회 여부' },
                },
            },
        },
        async req => await rolePermission(req.query.showAll)
    );
    //
};
