import { getAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser } from 'components/user/chzzk';

const StreamChannelRegex =
    /^(https?:\/\/)?(chzzk|play|bj|ch|www)?\.?(naver\.com|afreecatv\.com|sooplive\.co\.kr|youtube\.com)(\/channel|\/live)?\/([\w@]+)/;
// new RegExp('');

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

    const [, https, tier3, domain, , id] = data;

    switch (true) {
        case domain.includes('chzzk'):
            return await getChzzkUser(guildId, id);
        case ['afreecatv', 'sooplive'].includes(domain):
            return await getAfreecabeUser(guildId, id);
        case domain.includes('youtube'):
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

    switch (true) {
        case domain.includes('chzzk'):
            return await getChzzkUser(guildId, id);
        case ['afreecatv', 'sooplive'].includes(domain):
            return await getAfreecabeUser(guildId, id);
        case domain.includes('youtube'):
            return {
                id,
                type: StreamTarget.YOUTUBE,
            };
        default: {
            return null;
        }
    }
};
