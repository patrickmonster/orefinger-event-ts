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
