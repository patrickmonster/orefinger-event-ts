# Discord API interaction

디스코드 인터럭션 이벤트 By. fastify

Example
```js
import fp from 'fastify-plugin';
import rawBody from 'fastify-raw-body';

export default fp(async function (fastify, opts) {

    // 로우 코드 (인증용)
    fastify.register(rawBody, {
        field: 'rawBody',
        encoding: 'utf8', 
        runFirst: true,
    });

    /**
     * 인증용 함수를 제작 합니다.
     * 참조] https://discord.com/developers/docs/interactions/overview
     * 
     * headers 에 대/소문자 구분 없이 들어오는 경우가 있어, 두 가지 항목 모두 적용
     * 
     * @env DISCORD_PUBLIC_KEY - discord public key 입니다.
     */
    fastify.decorate('verifyKey', ({ body, headers, rawBody }) =>
        verifyKey(
            rawBody || JSON.stringify(body),
            `${headers['x-signature-ed25519'] || headers['X-Signature-Ed25519']}`,
            `${headers['x-signature-timestamp'] || headers['X-Signature-Timestamp']}`,
            `${process.env.DISCORD_PUBLIC_KEY}`
        )
    );

    /**
     * 인증을 실제 검증합니다.
     */
    fastify.decorate('verifyDiscordKey', (request: FastifyRequest, reply: FastifyReply, done: Function) => {
        const { method } = request;
        if (method === 'POST') {
            const isValidRequest = fastify.verifyKey(request);
            if (isValidRequest) return done();
        }
        return reply.code(401).send('Bad request signature');
    });

    /**
     * 인터렉션 코드를 생성합니다.
     * 
     * - interaction 을 생성하여, 각 함수 처리에 용의 하도록 만듭니다.
     */
    fastify.decorate(
        'interaction',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ): IReply => {
            const reply = new Reply(req, res);

            return {
                reply: reply.reply.bind(reply),
                differ: reply.differ.bind(reply),
                auth: reply.auth.bind(reply),
                model: reply.model.bind(reply),
                edit: reply.edit.bind(reply),
                differEdit: reply.differEdit.bind(reply),
                follow: reply.follow.bind(reply),
                get: reply.get.bind(reply),
                remove: reply.remove.bind(reply),
                interaction: reply,
            };
        }
    );
});
```