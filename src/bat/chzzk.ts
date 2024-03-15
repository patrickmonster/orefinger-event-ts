import axios from 'axios';
import { sendChannels } from 'components/notice';
import { insertLiveEvents, selectEventBats, updateLiveEvents } from 'controllers/bat';
import { APIEmbed } from 'discord-api-types/v10';
import { Content } from 'interfaces/API/Chzzk';
import { createActionRow, createSuccessButton } from 'utils/discord/component';
import sleep from 'utils/sleep';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};
/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
const convertVideoObject = (video_object: Content, name?: string): APIEmbed => {
    const {
        liveTitle: title,
        liveImageUrl,
        liveCategory: game_name,
        channel: { channelImageUrl, channelId, channelName },
    } = video_object;

    return {
        title,
        url: `https://chzzk.naver.com/live/${channelId}`,
        image: {
            url: liveImageUrl?.replace('{type}', '1080') || '',
        },
        author: {
            name: name ?? channelName,
            icon_url: channelImageUrl,
            url: `https://chzzk.naver.com/${channelId}`,
        },
        fields: [{ name: 'Game', value: `${game_name || 'LIVE'}`, inline: true }],
        footer: { text: '제공. Chzzk' },
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_ida
 * @param hash_id
 * @returns
 */
const getChannelLive = async (notice_id: number, hash_id: string, liveId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        axios
            .get(`https://api.chzzk.naver.com/service/v2/channels/${hash_id}/live-detail`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            })
            .then(async ({ data }) => {
                const { content } = data;
                if (content.liveId === liveId) return reject(null);
                if (content && content.status === 'OPEN') {
                    await insertLiveEvents(notice_id, content.liveId);
                } else {
                    if (liveId && liveId != '0') {
                        const result = await updateLiveEvents(notice_id);
                        if (result.changedRows == 0) return reject(null);
                        // 이미 처리된 알림
                    }
                }
                resolve(content as Content);
            })
            .catch(reject);
    });

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

        for (const { channels, notice_id, hash_id, message, name, id, img_idx } of list) {
            try {
                const liveStatus = await getChannelLive(notice_id, hash_id, id);
                if (liveStatus && liveStatus.status === 'OPEN') {
                    // online
                    sendChannels(channels, {
                        content: message,
                        embeds: [convertVideoObject(liveStatus, name)],
                        components: [
                            createActionRow(
                                createSuccessButton(`notice attendance ${notice_id}`, {
                                    label: '출석체크',
                                    emoji: { id: '1218118186717937775' },
                                })
                            ),
                        ],
                    });
                }
            } catch (e) {
                ERROR(hash_id);
                continue;
            }
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
        await sleep(100 * random); // Cull down the request
    } while (true);

    console.log('탐색 :: Youtube', new Date(), pageIndex);
};

const intervalIdx = setInterval(interval, 1000 * 60 * 13); // 9분마다 실행
console.log('Chzzk Batch Start!');
// interval();

process.on('SIGINT', function () {
    console.log('Chzzk Batch STOP!');
    clearInterval(intervalIdx);
});
