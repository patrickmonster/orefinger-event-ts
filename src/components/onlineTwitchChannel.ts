import { webhook } from 'controllers/online';
import { Deferred } from 'plugins/discord';
import discord from 'utils/discordApiInstance';

// 알림 채널
export default async (replay: Deferred, user_id: string, guild_id: string) => {
    //

    const channels = await discord.get<
        {
            id: string;
        }[]
    >(`/guilds/${guild_id}/channels`);
    // channels.
    const liveList = await webhook(user_id, 14);

    const channle = liveList.filter(({ channel_id }) => channels.find(({ id }) => id === channel_id));

    // 개수초과
    // if ( channle.length > 1){
    //     replay({
    //         content: `알림 채널이 ${channle.length}개가 있습니다.`
    //     })
    // }
    replay({
        content: '알림 채널이 없습니다.',
    });
};
