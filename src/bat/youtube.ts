import { sendChannels } from 'components/notice';
import { getChannelVideos } from 'components/youtubeUser';
import { selectEventBats } from 'controllers/bat';
import sleep from 'utils/sleep';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};

// 5분마다 실행되는 함수
const interval = async () => {
    const random = Math.floor(Math.random() * 100); // Random delay
    let pageIndex = 0;
    do {
        console.log('탐색 :: Youtube', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(2, {
            page: pageIndex,
            limit: 10,
        });

        for (const { channels, notice_id, hash_id, message, name, img_idx } of list) {
            try {
                const { videos, channel_title } = await getChannelVideos(notice_id, hash_id);
                for (const video of videos) {
                    sendChannels(channels, {
                        content: message,
                        embeds: [
                            {
                                ...video,
                                author: {
                                    name: name || channel_title,
                                    url: `https://www.youtube.com/channel/${hash_id}`,
                                },
                            },
                        ],
                    });
                } // for
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

const intervalIdx = setInterval(interval, 1000 * 60 * 10); // 5분마다 실행
console.log('Youtube Batch Start!');

process.on('SIGINT', function () {
    console.log('Youtube Batch STOP!');
    clearInterval(intervalIdx);
});
