import { FastifyInstance } from 'fastify';
import { createCanvas, loadImage } from 'canvas';
import dayjs from 'dayjs';

import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

import { getAuthBadge } from 'controllers/auth';
import api from 'utils/twitchApiInstance';
import authTwitchBadge from 'components/authTwitchBadge';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: {
            id: string;
        };
    }>(
        '/badge/:id',
        {
            schema: {
                tags: ['뱃지'],
                summary: '뱃지',
                description: '뱃지',
            },
        },
        (req, res) => {
            res.type('image/png');
            const { id } = req.params;
            const w = 500,
                h = 500;
            //
            const badgePath = join(process.env.EFS_ROOT || process.cwd(), 'badge', `${id}.png`);

            if (existsSync(badgePath)) {
                res.send(createReadStream(badgePath));
            } else {
                getAuthBadge(req.params.id).then(async ([user]) => {
                    const logo = await loadImage('https://cdn.orefinger.click/public/logo.png');
                    if (!user) {
                        const canvas = createCanvas(w, h);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(logo, 0, 0, w, h);
                        res.send(canvas.toBuffer('image/png'));
                        return;
                    }

                    const {
                        data: [channel],
                    } = await api.get<{
                        data: {
                            id: string;
                            user_id: string;
                            user_login: string;
                            user_name: string;
                            game_id: string;
                            game_name: string;
                            type: string;
                            title: string;
                            tags: string[];
                            viewer_count: number;
                            started_at: string;
                            language: string;
                            thumbnail_url: string;
                            tag_ids: string[];
                            is_mature: string;
                        }[];
                    }>(`/streams?user_id=${id}&type=live`);

                    // res.send();
                    await authTwitchBadge(id, user, channel, badgePath);

                    res.send(createReadStream(badgePath));
                });
            }
        }
    );
};
