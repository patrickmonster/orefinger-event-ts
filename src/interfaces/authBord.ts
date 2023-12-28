export interface AuthBordPK {
    guild_id: string;
    type: string;
}
export interface AuthBord extends AuthBordPK {
    role_id: string;
    embed_id: string;
    use_yn: string;
    create_at: string;
    update_at: string;
}
