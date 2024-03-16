import { getChannelVideos, getVod } from 'components/laftelUser';
import { sendChannels } from 'components/notice';
import { selectEventBats } from 'controllers/bat';
import sleep from 'utils/sleep';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};

// 5분마다 실행되는 함수
const interval = async () => {
    const random = Math.floor(Math.random() * 100); // Random delay
    let pageIndex = 0;

    const vodList = await getVod();
    const ids = vodList.map(v => `${v.id}`);

    do {
        console.log('탐색 :: Laftel', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(7, {
            page: pageIndex,
            limit: 10,
        });

        // notice_id : 내부 pk
        for (const { channels, notice_id, hash_id, message, name, img_idx } of list) {
            try {
                if (!ids.includes(hash_id)) {
                    // 종료된 알림 (더이상 방송하지 않는 경우)
                    console.log('종료된 알림', hash_id);
                    continue;
                }

                const videos = await getChannelVideos(notice_id, hash_id);
                for (const video of videos) {
                    sendChannels(channels, {
                        content: message,
                        embeds: [
                            {
                                ...video,
                                author: {
                                    name,
                                    url: `https://laftel.net/item/${hash_id}`,
                                },
                            },
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

    console.log('탐색 :: Laftel', new Date(), pageIndex);
};

const intervalIdx = setInterval(interval, 1000 * 60 * 13); // 9분마다 실행
console.log('Laftel Batch Start!');
// interval();

process.on('SIGINT', function () {
    console.log('Laftel Batch STOP!');
    clearInterval(intervalIdx);
});
