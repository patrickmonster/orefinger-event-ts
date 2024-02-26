export interface StationInfo {
    broad_start: string;
    grade: number;
    jointime: string;
    station_name: string;
    station_no: number;
    station_title: string;
    total_broad_time: number;
    user_id: string;
    user_nick: string;
    active_no: number;
}

export interface BroadInfo {
    user_id: string;
    broad_no: number;
    broad_title: string;
    current_sum_viewer: number;
    broad_grade: number;
    is_password: boolean;
}

export interface Content {
    profile_image: string;
    station: StationInfo;
    broad: BroadInfo;
}
