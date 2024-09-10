import { getAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser } from 'components/user/chzzk';

const StreamChannelRegex =
    /^(http(s):\/\/)(chzzk.naver.com|play.afreecatv.com|bj.afreecatv.com|afreecatv.com|www.youtube.com)(\/channel|\/live)?\/([\w|@]+)/;

export enum StreamTarget {
    YOUTUBE = 'YOUTUBE',
    AFREECA = 'AFREECA',
    CHZZK = 'CHZZK',
}

/**
 * url 링크 정보를 기반으로, 사용자의 알림 ID 를 가져 옵니다.
 * @param guildId
 * @param url
 * @returns
 */
export const getNoticeIdByUrl = async (guildId: string, url: string): Promise<StreamTarget | number | null> => {
    const data = StreamChannelRegex.exec(`${url}`);
    if (!data) return null;

    const [, , , domain, , id] = data;

    switch (domain) {
        case 'chzzk.naver.com':
            return await getChzzkUser(guildId, id);
        case 'play.afreecatv.com':
        case 'bj.afreecatv.com':
        case 'afreecatv.com':
            return await getAfreecabeUser(guildId, id);

        case 'www.youtube.com':
            return StreamTarget.YOUTUBE;
        default: {
            return null;
        }
    }
};

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

    const [, , , domain, , id] = data;

    switch (domain) {
        case 'chzzk.naver.com':
            return await getChzzkUser(guildId, id);
        case 'play.afreecatv.com':
        case 'bj.afreecatv.com':
        case 'afreecatv.com':
            return await getAfreecabeUser(guildId, id);

        case 'www.youtube.com':
        case 'youtube.com':
            return {
                id,
                type: StreamTarget.YOUTUBE,
            };
        default: {
            return null;
        }
    }
};
