import { upsertNotice } from 'controllers/notice';
import { ChannelData } from 'interfaces/API/Chzzk';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';

const chzzk = getChzzkAPI('v1');

export const getChzzkUser = async (chzzkHash: string) => {
    try {
        const { code, message, content } = await chzzk.get<ChzzkInterface<ChannelData>>(`channels/${chzzkHash}`);
        if (code !== 200) {
            console.log('CHZZK 사용자 정보를 찾을 수 없습니다.', message);
            return 0;
        }

        // 알림 등록
        const noticeId = await upsertNotice(
            {
                hash_id: chzzkHash,
                notice_type: 3,
                message: '|| @everyone ||',
                name: content.channelName,
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
 * 치지직 알림 데시보드
 * @param chzzkHash
 */
export const getChzzkUserByHash = async (chzzkHash: string, guildId: string) => {
    // TODO : getChzzkUserByHash
};
