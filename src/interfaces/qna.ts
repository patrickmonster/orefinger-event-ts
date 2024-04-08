export interface QnaBordPK {
    guild_id: string;
    type: string;
}
export interface QnaBord extends QnaBordPK {
    embed_id: string;
    use_yn: string;
    button: string;
    last_message: string;
    create_at: string;
    update_at: string;
}
