import { onlineChannels } from 'controllers/channel';

import { channels as guildChannels } from 'components/guild';
// 알림 채널 선택
export default async (replay: Function, user_id: string, guild_id: string) => {
    //
    // onlineChannels(user_id, ['0'])
    const channels = await guildChannels(guild_id); // 길드 채널 탐색
    const online = await onlineChannels(
        // 온라인 채널 확인
        user_id,
        channels.map(e => e.id)
    );

    console.log('online', online);

    // 1개 이상 - 채널 변경
    if (online.length < 0) {
        // 채널 생성
    }
};
