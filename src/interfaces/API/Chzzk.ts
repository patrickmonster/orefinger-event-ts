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

export interface ChannelData {
    channelId: string;
    channelName: string;
    channelImageUrl: string;
    verifiedMark: boolean;

    openLive?: boolean; // 오픈 라이브 여부
}

// 주석 : 안씀
export interface Content {
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
