import { selectNoticeByGuild } from 'controllers/notice';
import { MessageInteraction } from 'interactions/message';

import axios from 'axios';
import { webhookCreate } from 'components/discord';
import { convertVideoObject as convertAfreecaVideoObject, getLive as getAfreecaLive } from 'components/user/afreeca';
import { convertVideoObject as convertChzzkVideoObject, getLive as getChzzkLive } from 'components/user/chzzk';
import { appendUrlHttp } from 'utils/object';

/**
 *
 * 알림 프로필
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string) => {
    const { guild_id, user, member, channel } = interaction;
    const apiUser = member?.user || user;
    if (!guild_id) return;

    await interaction.differ({ ephemeral: true });

    const notice = await selectNoticeByGuild(noticeId, guild_id);

    if (!notice) {
        return interaction.reply({
            content: '해당하는 알림이 존재하지 않습니다.',
            ephemeral: true,
        });
    }

    try {
        const { url } = await webhookCreate(
            channel.id,
            { name: '방송알리미', auth_id: apiUser?.id || '826484552029175808' },
            'Y'
        );

        if (!url) {
            return interaction.reply({
                content: '프로필을 생성하지 못했습니다.',
                ephemeral: true,
            });
        }
        switch (notice.notice_type) {
            case 5: {
                // 아프리카
                const live = await getAfreecaLive(notice.hash_id);
                if (!live) {
                    return interaction.reply({
                        content: `
해당하는 라이브가 존재하지 않습니다. 
(방송을 오래 키지 않았거나, 방송정보가 없으면 발생할 수 있습니다.) 

- 프로필은 생성되었으니, 안심하셔도 됩니다!
                        `,
                        ephemeral: true,
                    });
                }

                axios.post(url, {
                    username: live.station.user_nick || '방송알리미',
                    avatar_url: live.profile_image
                        ? appendUrlHttp(live.profile_image)
                        : 'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                    content: `
프로필이 설정됨을 알려 드립니다! 
(이제 방송알리미가 이 채널에 보내는 알림은 전부 각 프로필로 전송되요!)

* 해당 알림은 방송알리미 자원 시스템을 통하여 전송되었습니다.
* 전송에 필요한 자원이 부족하거나, 권한이 부족하면 알림이 취소되거나 변경될 수 있습니다.
                    `,
                    embeds: [convertAfreecaVideoObject(live, live.station.user_nick)],
                });

                break;
            }
            case 4: {
                // chzzk
                const live = await getChzzkLive(notice.hash_id);
                if (!live) {
                    return interaction.reply({
                        content: '해당하는 라이브가 존재하지 않습니다.',
                        ephemeral: true,
                    });
                }
                if ('livePlaybackJson' in live) delete live.livePlaybackJson;
                const { channelName, channelImageUrl } = live.channel;

                axios.post(url, {
                    username: channelName || '방송알리미',
                    avatar_url:
                        channelImageUrl ||
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                    content: `
프로필이 설정됨을 알려 드립니다! 
(이제 방송알리미가 이 채널에 보내는 알림은 전부 각 프로필로 전송되요!)

* 해당 알림은 방송알리미 자원 시스템을 통하여 전송되었습니다.
* 전송에 필요한 자원이 부족하거나, 권한이 부족하면 알림이 취소되거나 변경될 수 있습니다.
                        `,
                    embeds: [convertChzzkVideoObject(live, channelName)],
                });

                break;
            }
            case 2: {
                // 유튜브
                // skip
                break;
            }
        }

        interaction.reply({
            content: '프로필이 설정되었습니다.',
            ephemeral: true,
        });
    } catch (e) {
        return interaction.reply({
            content: '프로필을 생성하지 못했습니다. - 권한에러',
            ephemeral: true,
        });
    }
};
