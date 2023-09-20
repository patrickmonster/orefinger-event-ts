import { onlineChannels } from 'controllers/channel';

import { auth } from 'controllers/auth';
import { channelCreate, webhookCreate } from 'components/guild';
import { getUser } from 'components/twitch';
import { Deferred } from 'plugins/discord';
import errorEmbed from './errorEmbed';
// 알림 채널 선택
export default async (replay: Deferred, user_id: string, channel_id: string) => {
    const [user] = await getUser(user_id);

    if (!user) {
        // 무결성 에러 - 사용자 정보를 찾을 수 없는 상태
        return replay({
            content: '존재하지 않는 유저입니다.',
            embeds: [
                errorEmbed('', {
                    title: '존재하지 않는 유저입니다.',
                    description: 'Twitch - 계정정보가, Twtich에 등록되지 않거나, 탈퇴한 유저 입니다.',
                    target: `USER-${user_id}`,
                }),
            ],
        });
    }

    // 훅 생성
    const webhook = await webhookCreate(channel_id, {
        name: user.display_name,
        avatar: user.profile_image_url,
    });

    console.log('webhook', webhook);
};
