import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createCanvas, loadImage } from 'canvas';
import { drawImageWithRadius } from 'utils/canvas';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{}>(
        '/badge',
        {
            schema: {
                tags: ['뱃지'],
                summary: '뱃지',
                description: '뱃지',
            },
        },
        (req, res) => {
            res.type('image/png');
            const canvas = createCanvas(500, 250);
            const ctx = canvas.getContext('2d');
            // ctx.fillStyle = '#ffffff';
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

            loadImage('https://cdn.discordapp.com/attachments/682449668428529743/980727366903005274/IMG_0274.png').then(image => {
                drawImageWithRadius(ctx, image, 0, 0, 250, 250, 100);

                // 라이브 테그
                ctx.fillStyle = '#ffffff';

                res.send(canvas.toBuffer('image/png'));
            });
        }
    );
};
