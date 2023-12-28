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
