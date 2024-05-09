import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    // http://localhost:3000/link/chzzk/9351394
    fastify.get<{
        Params: { postId: string; target: string };
        Querystring: { hashId?: string };
    }>('/l/:target/:postId', { schema: { hide: true } }, async (req, res) => {
        const { postId, target } = req.params;
        const { hashId } = req.query;

        switch (target) {
            case '4':
            case 'chzzk': {
                return res.redirect(
                    301,
                    `https://chzzk.naver.com/${hashId ?? 'e229d18df2edef8c9114ae6e8b20373a'}/community/detail/${postId}`
                );
            }
            default:
                return res.code(404).send({ error: 'Not Found' });
        }
    });
};

// https://r.orefinger.click/chzzk/9351394
