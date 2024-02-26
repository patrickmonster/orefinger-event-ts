import { insertLiveEvents, selectEventBats, updateLiveEvents } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';

import { Content } from 'interfaces/API/Afreeca';

import afreecaAPI from 'utils/afreecaApiInstance';
import discord from 'utils/discordApiInstance';
import sleep from 'utils/sleep';

const randomIntegerInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns
 */
const convertVideoObject = (videoObject: Content, name?: string): APIEmbed => {
    const {
        broad: { broad_title: title, broad_no, user_id },
        station: { user_nick: channelName },
        profile_image: channelImageUrl,
    } = videoObject;

    return {
        title,
        url: `https://play.afreecatv.com/${user_id}/${broad_no}`,
        image: {
            url: `//liveimg.afreecatv.com/m/${broad_no}?${randomIntegerInRange(100, 999)}`,
        },
        author: {
            name: name ?? channelName,
            icon_url: channelImageUrl,
        },
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param noticeId
 * @param hashId
 * @returns
 */
const getChannelLive = async (noticeId: number, hashId: string, lastId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        afreecaAPI
            .get<Content>(`${hashId}/station`)
            .then(async content => {
                const {
                    broad, // 방송 정보
                    station, // 채널 정보
                    profile_image, // 프로필 이미지
                } = content;

                if (broad) {
                    // 온라인
                    const { broad_no } = broad;
                    if (lastId === broad_no) {
                        return reject(null);
                    } else {
                        await insertLiveEvents(noticeId, broad_no);
                    }
                } else {
                    // 오프라인
                    const result = await updateLiveEvents(noticeId);
                    if (result.changedRows == 0) {
                        // 이미 처리된 알림
                        return reject(null);
                    }
                }
                resolve(content);
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
        const { list, totalPage } = await selectEventBats(5, {
            page: pageIndex,
            limit: 10,
        });

        for (const { channels, notice_id, hash_id, message, name, img_idx, id } of list) {
            try {
                const liveStatus = await getChannelLive(notice_id, hash_id, id);
                if (liveStatus) {
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

const intervalIdx = setInterval(interval, 1000 * 60 * 5); // 5분마다 실행
console.log('Afreeca Batch Start!');
// interval();

process.on('SIGINT', function () {
    console.log('Afreeca Batch STOP!');
    clearInterval(intervalIdx);
});
