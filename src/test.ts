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
const w = 500,
    h = 500;

const _P = (max: number, t: number) => (max * t) / 100;

const canvas = createCanvas(w, h);
const ctx = canvas.getContext('2d');

const applyColor = (color: string) => {
    const red = parseInt(color.substring(1, 3), 16);
    const green = parseInt(color.substring(3, 5), 16);
    const blue = parseInt(color.substring(5, 7), 16);
};

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
}>(`/users?login=coomo_`).then(async ({ data: [user] }) => {
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
            broadcaster_id: string;
            broadcaster_login: string;
            broadcaster_name: string;
            broadcaster_language: string;
            game_id: string;
            game_name: string;
            title: string;
            delay: number;
            tags: string[];
            content_classification_labels: string[];
            is_branded_content: boolean;
        }[];
    }>(`/channels?broadcaster_id=${user.id}`);
    const padding = 10;
    const img = await loadImage(user.profile_image_url);
    const icon = await loadImage('https://cdn.orefinger.click/public/logo-twitch.svg');
    const logo = await loadImage('https://cdn.orefinger.click/public/logo.png');
    // const view = await loadImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.login}-1920x1080.jpg`);

    console.log(channel);

    ctx.textAlign = 'center';
    // trance(ctx, () => {
    //     ctx.imageSmoothingEnabled = true;
    //     ctx.shadowBlur = 0.5;

    //     ctx.filter = 'blur(1px)';

    // });

    // ctx.drawImage(img, 0, 0, 250, 250);
    bluerSpace(ctx, img, 0, 0, w, h, 6);
    // drawFullColor(ctx, icon, '#ffffff', padding, padding + 5, w, h);
    drawImageWithRadius(ctx, img, padding, padding + 5, w, h, w / 2 - padding);

    // // 라이브 테두리
    trance(ctx, () => {
        const x = 5,
            y = 10;
        const grd = ctx.createLinearGradient(0, 0, w, h);

        grd.addColorStop(0, 'blue');
        grd.addColorStop(0.5, 'red');
        grd.addColorStop(1, 'green');

        ctx.fillStyle = grd;
        const radius = w / 2 - 5;

        // ctx.moveTo(x + radius, y);
        ctx.arc(radius + x, radius + y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fill();
    });

    // 라이브 테그 작성
    // trance(ctx, () => {
    //     const x = 250 / 2 - 12,
    //         y = 0;
    //     ctx.fillStyle = '#ffffff';
    //     ctx.fillRect(x, y, 24, 9);
    //     ctx.fillStyle = 'red';
    //     ctx.font = 'bold 10px sans-serif';
    //     ctx.fillText('LIVE', 1 + x, 8 + y);
    // });
    ctx.moveTo(250, 0);

    drawFullColor(ctx, logo, color.color, _P(w, 90), _P(h, 90), 50, 50);
    // 사용자 정보 작성
    trance(ctx, () => {
        const x = 0,
            y = 0;
        ctx.fillStyle = color.color || '#ffffff';
        // drawText(ctx, user.display_name, _P(w, 50), 20);
        drawText(
            ctx,
            user.display_name,
            _P(w, 50),
            _P(h, 15),
            {
                font: 'bold 40px sans-serif',
                color: '#ffffff',
            }
            // 'white'
        );

        drawText(
            ctx,
            channel.tags.reduce((acc, cur, idx) => (acc += cur + (idx === channel.tags.length - 1 ? '' : ', ' + ((idx + 1) % 4 ? '' : '\n'))), ''),
            _P(w, 50),
            _P(h, 20),
            {
                font: 'bold 15px sans-serif',
                color: '#ffffff',
            }
            // 'white'
        );
        drawText(
            ctx,
            channel.title,
            _P(w, 50),
            _P(h, 25),
            {
                font: 'bold 15px sans-serif',
                color: '#ffffff',
            }
            // 'white'
        );
        // ctx.fillText(user.login, 250 + 50 + x, 230 + y);
    });

    canvas.createPNGStream().pipe(require('fs').createWriteStream('test.png'));
});
