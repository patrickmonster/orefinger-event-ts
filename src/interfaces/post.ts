export type Post = {
    id: string;
    title: string;
    description: string;
    type: string;
    use_yn?: string;
    public_yn?: string;
    commant_yn?: string;
    create_at: string;
    update_at: string;
    create_user: string;
    update_user: string;
    bookmark: number;
    like: number;
    bookmark_yn?: string;
    like_yn?: string;
};
export type Commant = {
    parent_id?: string;
    message: string;
    post_id: string;
};
export type PostTypeParams = {
    user_id?: string;
    type?: string;
};
export interface PostDtil {
    id: string;
    title: string;
    description: string;
    type: string;
    use_yn: boolean;
    public_yn: boolean;
    commant_yn: boolean;
    create_at: string;
    update_at: string;
    create_user: string;
    update_user: string;
    views: number;
    bookmark: number;
    like: number;
    bookmark_yn?: string;
    like_yn?: string;
    user_name: string;
    avatar?: string;
}
