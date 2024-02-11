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

export interface ChzzkContent<T> {
    data: T;
    page: { next: any; prev: any };
    totalCount: number;
}

export interface Comment {
    buffNerf: { buffCount: number; nerfCount: number };
    comment: CommentDetail;
    user: User;
}

export interface CommentDetail {
    commentId: number;
    commentType: string;
    replyCount: number;
    parentCommentId: number;
    content: string;
    mentionedUserIdHash: null;
    mentionedUserNickname: null;
    secret: boolean;
    hideByCleanBot: boolean;
    deleted: boolean;
    createdDate: string;
    objectType: string;
    objectId: string;
    loungeId: null;
    onlyOneEmoji: boolean;
    childObjectCount: number;
    attaches: Attach[];
}

export interface Attach {
    commentId: number;
    attachType: string;
    attachValue: string;
    extraJson: null;
    order: number;
    createdDate: string;
    updatedDate: string;
}

export interface User {
    userIdHash: string;
    userNickname: string;
    profileImageUrl: string;
    userLevel: number;
    writer: boolean;
    badge: {
        imageUrl: string;
    };
    title: {
        name: string;
        color: string;
    };
    userRoleCode: string;
    secretOpen: boolean;
    buffnerf: null;
    privateUserBlock: boolean;
    verifiedMark: boolean;
}
