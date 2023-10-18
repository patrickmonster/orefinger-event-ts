import { FastifyInstance } from 'fastify';
import { createCanvas, loadImage } from 'canvas';
import dayjs from 'dayjs';

import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

import { getAuthBadge, userUpdate } from 'controllers/auth';
import api from 'utils/twitchApiInstance';
import authTwitchBadge from 'components/authTwitchBadge';
import { getUser, usersUpdate } from 'components/twitch';
const w = 500,
    h = 500;

const sendBadge = async (res: any, message: string) => {
    const logo = await loadImage('https://cdn.orefinger.click/public/logo.png');
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(logo, 0, 0, w, h);

    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(message, w / 2, h / 2);
    res.send(canvas.toBuffer('image/png'));
};

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
            //
            const badgePath = join(process.env.EFS_ROOT || process.cwd(), 'badge', `${id}.png`);

            if (existsSync(badgePath)) {
                res.send(createReadStream(badgePath));
            } else {
                getAuthBadge(req.params.id)
                    .then(async ([user]) => {
                        if (!user) {
                            return await sendBadge(res, '사용자 정보가 없습니다!');
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

                        console.log(channel);
                        await authTwitchBadge(id, user, channel, badgePath);

                        console.log('badgePath', badgePath);

                        res.send(createReadStream(badgePath));
                    })
                    .catch(async e => {
                        console.log(e);

                        // 사용자 업데이트 분기처리
                        // getUser(id)
                        await usersUpdate(id);
                        await sendBadge(res, '사용자 정보를 불러오는중...');
                    });
            }
        }
    );
};
