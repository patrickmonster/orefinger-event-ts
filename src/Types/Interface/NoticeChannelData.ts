// Source: https://developers.google.com/youtube/v3/docs/channels#resource
export interface YoutubeChannelData {
    kind: string;
    etag: string;
    id: {
        kind: string;
        channelId: string;
    };
    snippet: {
        channelId: string;
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
            medium: {
                url: string;
                width: number;
                height: number;
            };
            high: {
                url: string;
                width: number;
                height: number;
            };
        };
    };
}
// Laftel VOD API
export interface LaftelVodPaging<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
interface LaftelVodImages {
    option_name: string;
    img_url: string;
    crop_ratio: string;
}

export interface LaftelVod {
    id: number;
    name: string;
    img: string;
    cropped_img: string;
    images: LaftelVodImages[];
    content_rating: string;
    rating: number;
    is_adult: boolean;
    genres: string[];
    medium: string;
    distributed_air_time: string;
    is_laftel_only: boolean;
    is_uncensored: boolean;
    is_dubbed: boolean;
    is_avod: boolean;
    avod_status: string;
    is_viewing: boolean;
    latest_episode_created: string;
    latest_published_datetime: string;
    is_episode_existed: boolean;
    is_expired: boolean;
}
interface LaftelVodDetailProduct {
    id: number;
    name: string;
    list_price: number;
    period: string;
}
interface LaftelVodDetailEpisodeProduct {}
interface LaftelVodDetailRating {
    rating: number;
    classification_number: string;
    broadcast_channel_name: string;
    broadcast_date: string;
    rating_components: any[];
}
interface LaftelVodAccessInfoList {}

export interface LaftelVodDetail {
    id: number;
    title: string;
    subject: string;
    description: string;
    episode_num: string;
    episode_order: number;
    thumbnail_path: string;
    has_preview: boolean;
    access_info_list: LaftelVodAccessInfoList[];
    running_time: string;
    progressbar: null;
    item_expire_datetime: null;
    in_app_download: boolean;
    is_avod: boolean;
    is_free: boolean;
    is_viewing: boolean;
    products: LaftelVodDetailProduct[];
    episode_products: LaftelVodDetailEpisodeProduct[];
    published_datetime: string;
    rating: LaftelVodDetailRating;
    access_type: null;
    is_available: boolean;
}
export interface ProfileData {
    userIdHash: string;
    nickname: string;
    profileImageUrl: string;
    userRoleCode: string;
    badge: string;
    title: string;
    verifiedMark: boolean;
    introduction: string;
    feedCount: number;
    buffCount: number;
    nerfCount: number;
    lastLoggedInDate: string;
    createdDate: string;
    updatedDate: string;
    commentCount: number;
    level: number;
    experiencePercent: number;
    editable: boolean;
    loungeBookmarkCount: number;
    feedBookmarkCount: number;
    storageBoxItemCount: number;
    officialNotiAgree: boolean;
    officialNotiAgreeUpdatedDate: string;
    reservationNotiAgree: boolean;
    commentNotiAgree: boolean;
}

// Chzzk API
export interface ChzzkChannelData {
    channelId: string;
    channelName: string;
    channelImageUrl: string;
    verifiedMark: boolean;

    openLive?: boolean; // 오픈 라이브 여부
}
// 주석 : 안씀

export interface ChzzkContent {
    liveId: number;
    liveTitle: string;
    status: string;
    liveImageUrl: string | null;
    defaultThumbnailImageUrl: null;
    concurrentUserCount: number;
    accumulateCount: number;
    openDate: string;
    closeDate: null;
    adult: boolean;
    channelId: string;
    chatChannelId: string;
    categoryType: null;
    liveCategory: string;
    liveCategoryValue: string;
    chatActive: boolean;
    chatAvailableGroup: string;
    paidPromotion: boolean;
    chatAvailableCondition: string;
    minFollowerMinute: number;
    channel: {
        channelId: string;
        channelName: string;
        channelImageUrl: string;
        verifiedMark: boolean;
    };
    livePollingStatusJson?: string;
    p2pQuality?: any[];
    // livePlaybackJson?: string;
    userAdultStatus: null;
}
export interface ChzzkPostComment {
    commentId: number;
    commentType: string;
    replyCount: number;
    parentCommentId: number;
    content: string;
    mentionedUserIdHash: string;
    mentionedUserNickname: string;
    secret: boolean;
    hideByCleanBot: boolean;
    deleted: boolean;
    createdDate: string;
    attaches: any;
    objectType: string;
    objectId: string;
    loungeId: string;
    onlyOneEmoji: boolean;
    childObjectCount: number;
}

export interface ChzzkPostUser {
    userIdHash: string;
    userNickname: string;
    profileImageUrl: string;
    userLevel: number;
    writer: boolean;
    badge: any;
    title: any;
    userRoleCode: string;
    secretOpen: boolean;
    buffnerf: any;
    privateUserBlock: boolean;
    verifiedMark: boolean;
}
export interface ChzzkInterface<T extends object> {
    code: number;
    message: string;
    content: T;
}
export interface YoutubeChannelObject {
    title: string;
    description: string;
    rssUrl: string;
    externalId: string;
    keywords: string;
    channelUrl: string;
    isFamilySafe: boolean;
    androidDeepLink: string;
    androidAppindexingLink: string;
    iosAppindexingLink: string;
    vanityChannelUrl: string;
}
export interface SoopChannelData {
    user_id: string;
    user_nick: string;
    station_logo: string;
    medal: boolean;
    broad_no: string;
}
