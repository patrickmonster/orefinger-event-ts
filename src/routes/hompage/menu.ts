import { selectMenus } from 'controllers/hompage/menu';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get(
        '/menu',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '홈페이지 메뉴 리스트',
                tags: ['homepage'],
                deprecated: false,
            },
        },
        async req => await selectMenus(req.user.id)
    );
    
};
