import { insertVideoEvents, selectVideoEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { catchRedis } from 'utils/redis';

import { LaftelVodDetail, LaftelVodPaging } from 'interfaces/API/Laftel';
import laftel, { getLaftelVods } from 'utils/laftelApiInstance';

export const getVod = async () => await catchRedis('laftel:vod', async () => await getLaftelVods(), 60 * 60 * 24);

export const getLaftelVod = async (vodId: string | number) => {
    try {
        const vod = await getVod();

        if (!vod) {
            console.log('LAFTEL :: VOD 정보를 불러오지 못함', vodId);
            return -1;
        }

        const vodInfo = vod.find(v => v.id == vodId);

        if (!vodInfo) {
            console.log('LAFTEL :: VOD 정보를 찾을 수 없음', vodId);
            return 0;
        }

        // 알림 등록
        const noticeId = await upsertNotice(
            {
                hash_id: `${vodInfo.id}`,
                notice_type: 7,
                message: `|| @everyone || ${vodInfo.name}`,
                name: vodInfo.name,
            },
            true
        );

        return noticeId;
    } catch (e) {
        console.log('CHZZK 사용자 정보를 찾을 수 없습니다.', e);

        return 0;
    }
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param noticeId 비디오 id
 * @param hashId 비디오 콘텐츠 id
 * @returns
 */
export const getChannelVideos = async (noticeId: number, hashId: string) =>
    new Promise<APIEmbed[]>((resolve, reject) => {
        laftel
            .get<LaftelVodPaging<LaftelVodDetail>>(
                `/episodes/v2/list/?item_id=${hashId}&sort=oldest&limit=1000&show_playback_offset=false&offset=0`,
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                }
            )
            .then(async ({ results }) => {
                const oldVideos = await selectVideoEvents(noticeId);
                const videos = [];
                for (const video_object of results) {
                    const { id, title, subject } = video_object;
                    // 이미 등록된 비디오는 건너뜁니다 (중복 방지)
                    if (oldVideos.find(v => v.video_id == `${id}`)) continue;

                    try {
                        await insertVideoEvents(noticeId, `${id}`, subject);
                        videos.push(convertVideoObject(hashId, video_object));
                    } catch (e) {
                        continue;
                    }
                }
                resolve(videos);
            })
            .catch(reject);
    });

/**
 * 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns
 */
const convertVideoObject = (hashId: string, videoObject: LaftelVodDetail, name?: string): APIEmbed => {
    const { id, title, subject, thumbnail_path: liveImageUrl } = videoObject;

    return {
        title: subject,
        url: `https://laftel.net/player/${hashId}/${id}`,
        image: { url: liveImageUrl },
        author: {
            name: name ?? title,
            url: `https://laftel.net/item/${hashId}`,
        },
        footer: { text: '제공. Laftel' },
    };
};
