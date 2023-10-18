import { createCanvas, loadImage } from 'canvas';
import { bluerSpace, drawFullColor, drawImageWithRadius, drawText, trance } from 'utils/canvas';

import { join } from 'path';
import { env } from 'process';
import { existsSync } from 'fs';
import { config } from 'dotenv';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import api from 'utils/twitchApiInstance';
import { getTimeDiff } from 'utils/day';
import dayjs from 'dayjs';
import { channel } from 'diagnostics_channel';
const w = 500,
    h = 500;

const _P = (max: number, t: number) => (max * t) / 100;

const canvas = createCanvas(w, h);
const ctx = canvas.getContext('2d');
api.get<{
    data: {
        id: string;
        login: string;
        display_name: string;
        type: string;
        broadcaster_type: string;
        description: string;
        profile_image_url: string;
        offline_image_url: string;
        view_count: number;
        email: string;
        created_at: string;
    }[];
    // rijeeeee coomo_ summerraintv
}>(`/users?login=yeon2vt`).then(async ({ data: [user] }) => {
    console.log(user);
    if (!user) {
        return;
    }

    const {
        data: [color],
    } = await api.get<{ data: { color: string }[] }>(`/chat/color?user_id=${user.id}`);
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
    }>(`/streams?user_id=${user.id}&type=live`);
    // const color = { color: '#8A2BE2' };
    // const channel = {
    //     broadcaster_id: '646825915',
    //     broadcaster_login: 'rijeeeee',
    //     broadcaster_name: '리제ㆍ',
    //     broadcaster_language: 'ko',
    //     game_id: '21779',
    //     game_name: 'League of Legends',
    //     title: '🐰회복하구 보쟈..💜🐰',
    //     delay: 0,
    //     tags: ['한국어', '라디오', 'Radio', 'ASMR', 'ASMRvisual', '시참', '카단', '찐리', 'liliseeee7'],
    //     content_classification_labels: [],
    //     is_branded_content: false,
    // };
    const padding = 10;
    const img = await loadImage(user.profile_image_url);
    const logo = await loadImage('https://cdn.orefinger.click/public/logo.png');

    console.log(color, channel);

    ctx.textAlign = 'center';
    // trance(ctx, () => {
    //     ctx.imageSmoothingEnabled = true;
    //     ctx.shadowBlur = 0.5;

    //     ctx.filter = 'blur(1px)';

    // });

    // ctx.drawImage(img, 0, 0, 250, 250);
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
            user.display_name,
            _P(w, 50),
            _P(h, 15),
            {
                font: 'bold 40px sans-serif',
                color: color.color || '#ffffff',
            }
            // 'white'
        );
    });

    canvas.createPNGStream().pipe(require('fs').createWriteStream('test.png'));
});
