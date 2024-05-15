import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
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

    fastify.get<{
        Querystring: { t?: string };
    }>('/help', { schema: { hide: true } }, (q, r) => {
        if (!q.query.t) return r.redirect(301, `https://orefinger.notion.site/`);
        switch (q.query.t) {
            case 'bot':
                return r.redirect(301, `https://orefinger.notion.site/Chzzk-Bata-abe6b265f0e74356b300af8fbe76d0cc`);
            default:
                return r.code(404).send({ error: 'Not Found' });
        }
    });

    fastify.get<{
        Params: { channelId: string };
    }>('/bot/:channelId', { schema: { hide: true, description: '명령어 리스트 바로가기' } }, (q, r) => {
        return r.redirect(301, `https://orefinger.click/chzzk/bot/${q.params.channelId}`);
    });
};
