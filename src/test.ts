import { createCanvas, loadImage } from 'canvas';
import { drawImageWithRadius, trance } from 'utils/canvas';

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

const canvas = createCanvas(500, 250);
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
}>(`/users?login=noir1113`).then(async ({ data: [user] }) => {
    console.log(user);
    if (!user) {
        return;
    }

    const {
        data: [color],
    } = await api.get<{
        data: {
            color: string;
        }[];
    }>(`/chat/color?user_id=${user.id}`);
    const padding = 10;
    const img = await loadImage(user.profile_image_url);
    drawImageWithRadius(ctx, img, padding, padding + 5, 250, 250, 250 / 2 - padding);

    // 라이브 테두리
    trance(ctx, () => {
        const x = 5,
            y = 10;
        const grd = ctx.createLinearGradient(0, 0, 250, 250);

        grd.addColorStop(0, 'blue');
        grd.addColorStop(0.5, 'red');
        grd.addColorStop(1, 'green');

        ctx.fillStyle = grd;
        const radius = 250 / 2 - 5;
        ctx.arc(radius + x, radius + y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fill();
    });

    // 라이브 테그 작성
    trance(ctx, () => {
        const x = 250 / 2 - 12,
            y = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 24, 9);
        ctx.fillStyle = 'red';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('LIVE', 1 + x, 8 + y);
    });

    // 사용자 정보 작성
    trance(ctx, () => {
        const x = 0,
            y = 0;
        ctx.fillStyle = color.color || '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(user.display_name, 250 + x, 40 + y);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(dayjs(user.created_at).format('YY년MM월DD일'), 250 + x, 70 + y);
        // if (user.broadcaster_type) ctx.fillText(`트위치'${user.broadcaster_type}'`, 250 + x, 90 + y);
        // ctx.fillText(user.broadcaster_type, 250 + x, 60 + y);
        ctx.fillText(`twitch.tv/${user.login}`, 250 + x, 230 + y);
    });

    canvas.createPNGStream().pipe(require('fs').createWriteStream('test.png'));
});
