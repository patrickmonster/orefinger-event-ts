import { Channel, Video } from './api';
import { NoticeOptions, accessToken, notice, profileCard } from './api/chat';
import { User } from './api/user';
import { ChzzkChat, ChzzkChatOptions } from './chat';
import { DEFAULT_BASE_URLS } from './const';
import { ChzzkChatFunc, ChzzkClientOptions } from './types';

const CHZZK_BASE_URL = 'https://api.chzzk.naver.com';
const GAME_BASE_URL = 'https://comm-api.game.naver.com/nng_main';

export class ChzzkClient {
    readonly options: ChzzkClientOptions;

    constructor(options: ChzzkClientOptions = {}) {
        options.baseUrls = options.baseUrls || DEFAULT_BASE_URLS;
        options.userAgent =
            options.userAgent ||
            'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36';

        this.options = options;
    }

    get hasAuth() {
        return !!(this.options.nidAuth && this.options.nidSession);
    }

    get chat(): ChzzkChatFunc {
        const func = (options: string | ChzzkChatOptions) => {
            if (typeof options == 'string') {
                if (options.length != 6) {
                    throw new Error('Invalid chat channel ID');
                }

                return ChzzkChat.fromClient(options, this);
            }

            return new ChzzkChat({
                client: this,
                baseUrls: this.options.baseUrls,
                pollInterval: 30 * 1000,
                ...options,
            });
        };

        func.accessToken = async (chatChannelId: string) => accessToken(this, chatChannelId);
        func.profileCard = async (chatChannelId: string, userIdHash: string) =>
            profileCard(this, chatChannelId, userIdHash);
        func.notice = async (chatChannelId: string, options?: NoticeOptions) => notice(this, chatChannelId, options);

        return func;
    }

    async user(): Promise<User> {
        return this.fetch(`${this.options.baseUrls.gameBaseUrl}/v1/user/getUserStatus`).then(
            data => data['content'] ?? null
        );
    }

    async channel(channelId: string): Promise<Channel> {
        return this.fetch(`/service/v1/channels/${channelId}`)
            .then(data => data['content'])
            .then(content => (content?.channelId ? content : null));
    }

    async video(videoNo: string | number): Promise<Video> {
        return this.fetch(`/service/v1/videos/${videoNo}`).then(r => r['content'] ?? null);
    }

    fetch(pathOrUrl: string, options?: RequestInit): Promise<any> {
        const headers = {
            'User-Agent': this.options.userAgent,
            ...(options?.headers || {}),
        };

        if (this.hasAuth) {
            headers['Cookie'] = `NID_AUT=${this.options.nidAuth}; NID_SES=${this.options.nidSession}`;
        }

        if (pathOrUrl.startsWith('/') && !pathOrUrl.startsWith(GAME_BASE_URL)) {
            pathOrUrl = `${CHZZK_BASE_URL}${pathOrUrl}`;
        }

        return fetch(pathOrUrl, {
            ...options,
            headers,
        }).then(r => r.json());
    }
}
