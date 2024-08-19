export interface PointPK {
    idx: number;
}
export interface PshopItem extends PointPK {
    guild_id: string;
    point: number;
    name: string;
    detail: string;
    use_yn: string;
    create_at: string;
    update_at: string;
    create_user: string;
    update_user: string;
}
