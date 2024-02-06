import axios from 'axios';
import { insertLiveEvents, selectEventBats, updateLiveEvents } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';
import discord from 'utils/discordApiInstance';
import sleep from 'utils/sleep';

// 주석 : 안씀
interface Content {
    liveId: number;
    liveTitle: string;
    status: string;
    liveImageUrl: string;
    defaultThumbnailImageUrl: null;
    concurrentUserCount: number;
    accumulateCount: number;
    openDate: string;
    closeDate: null;
    adult: boolean;
    chatChannelId: string;
    categoryType: null;
    liveCategory: string;
    liveCategoryValue: string;
    chatActive: boolean;
    chatAvailableGroup: string;
    paidPromotion: boolean;
    chatAvailableCondition: string;
    minFollowerMinute: number;
    // livePlaybackJson: string;
    channel: {
        channelId: string;
        channelName: string;
        channelImageUrl: string;
        verifiedMark: boolean;
    };
    // livePollingStatusJson: string;
    userAdultStatus: null;
}

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
const convertVideoObject = (video_object: Content, name?: string): APIEmbed => {
    const {
        liveTitle: title,
        liveImageUrl,
        channel: { channelImageUrl, channelId, channelName },
    } = video_object;

    return {
        title,
        url: `https://www.chzzk.com/live/${channelId}`,
        image: {
            url: liveImageUrl,
        },
        author: {
            name: name ?? channelName,
            icon_url: channelImageUrl,
        },
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 */
const getChannelLive = async (notice_id: number, hash_id: string) =>
    new Promise<Content | null>((resolve, reject) => {
        axios
            .get(`https://api.chzzk.naver.com/service/v2/channels/${hash_id}/live-detail`)
            // .get(`https://api.chzzk.naver.com/polling/v2/channels/${hash_id}/live-status`)
            .then(async ({ data }) => {
                const { content } = data;
                if (content && content.status === 'OPEN') {
                    await insertLiveEvents(notice_id, hash_id);
                } else {
                    const result = await updateLiveEvents(notice_id, hash_id);
                    if (result.changedRows == 0) {
                        // 이미 처리된 알림
                        return reject(null);
                    }
                }
                resolve(content as Content);
            })
            .catch(reject);
    });

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message TODO : message 객체
 */
const sendChannels = async (channels: NoticeChannel[], message: any) => {
    for (const { notice_id, channel_id } of channels) {
        console.log('sendChannels', notice_id, channel_id);
        discord.post(`/channels/${channel_id}/messages`, message).catch(() => {
            deleteNoticeChannel(notice_id, channel_id).catch(e => {
                console.log('Error: ', e);
            });
        });
    }
};

// 5분마다 실행되는 함수
const interval = async () => {
    const random = Math.floor(Math.random() * 100); // Random delay
    let pageIndex = 0;
    do {
        console.log('탐색 :: Chzzk', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(4, {
            page: pageIndex,
            limit: 10,
        });

        for (const { channels, notice_id, hash_id, message, name, img_idx } of list) {
            try {
                const liveStatus = await getChannelLive(notice_id, hash_id);
                if (liveStatus && liveStatus.status === 'OPEN') {
                    // online
                    sendChannels(channels, {
                        content: message,
                        embeds: [convertVideoObject(liveStatus, name)],
                    });
                } else {
                    // offline
                }
            } catch (e) {
                console.log('Error: ', hash_id);
                continue;
            }
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
        await sleep(100 * random); // Cull down the request
    } while (true);

    console.log('탐색 :: Youtube', new Date(), pageIndex);
};

setInterval(interval, 1000 * 60 * 5); // 5분마다 실행
console.log('Chzzk Batch Start!');
// interval();
