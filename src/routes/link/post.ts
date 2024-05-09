import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    // http://localhost:3000/link/chzzk/9351394
    fastify.get<{
        Params: { postId: string };
        Querystring: { hashId?: string };
    }>('/chzzk/:postId', { schema: { hide: true } }, async (req, res) => {
        const { postId } = req.params;
        const { hashId } = req.query;
        res.redirect(
            301,
            `https://chzzk.naver.com/${hashId ?? 'e229d18df2edef8c9114ae6e8b20373a'}/community/detail/${postId}`
        );
    });
};
