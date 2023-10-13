import { createWriteStream } from 'fs';

import { createCanvas, loadImage } from 'canvas';
import dayjs from 'dayjs';
import { bluerSpace, drawFullColor, drawImageWithRadius, drawText, trance } from 'utils/canvas';

import api from 'utils/twitchApiInstance';

const w = 500,
    h = 500,
    padding = 10;

type Channel = {
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
};

type User = {
    user_id: string;
    auth_id: string;
    login: string;
    name: string;
    kr_name: string;
    user_type: string;
    avatar: string;
};

const _P = (max: number, t: number) => (max * t) / 100;

export default async (user_id: string, user: User, channel: Channel | null | undefined, savePath: string) => {
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    const {
        data: [color],
    } = await api.get<{ data: { color: string }[] }>(`/chat/color?user_id=${user_id}`);

    console.log('color', color);

    ctx.textAlign = 'center';

    console.log('loading image', user.avatar);
    const img = await loadImage(user.avatar);
    console.log('loading image', 'https://cdn.orefinger.click/public/logo.png');
    const logo = await loadImage('https://cdn.orefinger.click/public/logo.png');

    bluerSpace(ctx, img, 0, 0, w, h, 6);
    drawFullColor(ctx, logo, color.color, _P(w, 90), _P(h, 90), 50, 50);

    drawImageWithRadius(ctx, img, padding, padding, w, h, w / 2 - padding);

    if (channel) {
        trance(ctx, () => {
            const radius = w / 2 - padding;
            const x = padding,
                y = padding;
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
            ctx.clip();

            ctx.fillStyle = '#00000059';
            ctx.fillRect(0, 0, w, _P(h, 30));
            ctx.moveTo(0, _P(h, 83));
            ctx.fillRect(0, _P(h, 83), w, h);
        });
        trance(ctx, () => {
            const x = 5,
                y = 5;
            const grd = ctx.createLinearGradient(0, 0, w, h);

            grd.addColorStop(0, 'blue');
            grd.addColorStop(0.5, 'red');
            grd.addColorStop(1, 'green');

            ctx.fillStyle = grd;
            const radius = w / 2 - 5;

            ctx.moveTo(x + radius * 2, y + radius);

            ctx.arc(radius + x, radius + y, radius + 4, 0, Math.PI * 2);
            ctx.clip();

            ctx.arc(radius + x, radius + y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fill();
        });

        trance(ctx, () => {
            ctx.fillStyle = color.color || '#ffffff';
            // drawText(ctx, user.display_name, _P(w, 50), 20);

            drawText(
                ctx,
                `[${channel.tags.reduce(
                    (acc, cur, idx) => (acc += cur + (idx === channel.tags.length - 1 ? '' : ', ' + ((idx + 1) % 5 ? '' : '\n'))),
                    ''
                )}]`,
                _P(w, 50),
                _P(h, 20),
                {
                    font: 'bold 15px sans-serif',
                    color: color.color || '#ffffff',
                }
                // 'white'
            );

            drawText(
                ctx,
                channel.title,
                _P(w, 50),
                _P(h, 90),
                {
                    font: 'bold 20px sans-serif',
                    color: color.color || '#ffffff',
                }
                // 'white'
            );
            drawText(ctx, `${channel.game_name}`, _P(w, 50), _P(h, 95), {
                font: 'bold 20px sans-serif',
                color: color.color || '#ffffff',
            });
            drawText(ctx, `LIVE] ${dayjs(channel.started_at).format('HH:mm')} ~`, _P(w, 50), _P(h, 7), {
                font: 'bold 20px sans-serif',
                color: color.color || '#ffffff',
            });
            // ctx.fillText(user.login, 250 + 50 + x, 230 + y);
        });
    } else {
        trance(ctx, () => {
            const radius = w / 2 - padding;
            const x = padding,
                y = padding;
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
            ctx.clip();

            ctx.fillStyle = '#ffffff59';
            ctx.fillRect(0, 0, w, _P(h, 20));
        });
    }

    trance(ctx, () => {
        ctx.fillStyle = color.color || '#ffffff';
        drawText(
            ctx,
            user.name,
            _P(w, 50),
            _P(h, 15),
            {
                font: 'bold 40px sans-serif',
                color: color.color || '#ffffff',
            }
            // 'white'
        );
    });

    canvas.createPNGStream().pipe(createWriteStream(savePath));
};
