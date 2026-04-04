import { getAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser } from 'components/user/chzzk';
import { getCimeUser } from './cime';

const StreamChannelRegex =
    /^(http(s):\/\/)(chzzk.naver.com|play.afreecatv.com|bj.afreecatv.com|afreecatv.com|sooplive.co.kr|sooplive.com|www.sooplive.co.kr|www.sooplive.com|bj.sooplive.co.kr|bj.sooplive.com|ch.sooplive.co.kr|ch.sooplive.com|play.sooplive.co.kr|play.sooplive.com|www.youtube.com|youtube.com|ci.me)(\/channel|\/live|\/station|\d)?\/([\w|@]+)/;

export enum StreamTarget {
    YOUTUBE = 'YOUTUBE',
    AFREECA = 'AFREECA',
    CHZZK = 'CHZZK',
    CIME = 'CIME',
}

/**
 * url 링크 정보를 기반으로, 사용자의 알림 ID 를 가져 옵니다.
 * @param guildId
 * @param url
 * @returns
 */
export const getUrlByNoticeId = async (
    guildId: string,
    url: string
): Promise<
    | {
          id: string;
          type: StreamTarget;
      }
    | number
    | null
> => {
    const data = StreamChannelRegex.exec(`${url}`);

    if (!data) return null;
    console.log(data, url);

    const [, , , domain, , id] = data;

    switch (domain) {
        case 'chzzk.naver.com':
            return await getChzzkUser(guildId, id);
        case 'play.afreecatv.com':
        case 'bj.afreecatv.com':
        case 'afreecatv.com':
        case 'www.sooplive.co.kr':
        case 'sooplive.co.kr':
        case 'play.sooplive.co.kr':
        case 'bj.sooplive.co.kr':
        case 'www.sooplive.com':
        case 'sooplive.com':
        case 'play.sooplive.com':
        case 'bj.sooplive.com':
            return await getAfreecabeUser(guildId, id);

        case 'www.youtube.com':
        case 'youtube.com':
            return {
                id,
                type: StreamTarget.YOUTUBE,
            };
        case 'ci.me':
            return await getCimeUser(guildId, id.replace('@', ''));
        default: {
            return null;
        }
    }
};
