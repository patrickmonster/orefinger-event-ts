import { getLiveMessage } from 'components/afreecaUser';
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
        console.log('탐색 :: Afreeca', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(5, {
            page: pageIndex,
            limit: 10,
        });

        for (const item of list) {
            try {
                getLiveMessage(item);
            } catch (e) {
                ERROR(item.hash_id);
                continue;
            }
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
        await sleep(100 * random); // Cull down the request
    } while (true);

    console.log('탐색 :: Afreeca', new Date(), pageIndex);
};

const intervalIdx = setInterval(interval, 1000 * 60 * 9); // 5분마다 실행
console.log('Afreeca Batch Start!');
// interval();

process.on('SIGINT', function () {
    console.log('Afreeca Batch STOP!');
    clearInterval(intervalIdx);
});
