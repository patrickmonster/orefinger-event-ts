export interface EmbedCreate {
    embed_id: number;
    tag: string;
    title_id?: number;
    description_id?: number;
    url?: string;
    timestamp?: string;
    color?: number;
    footer_text?: string;
    footer_icon_url?: string;
    image?: string;
    thumbnail?: string;
    provider_name?: string;
    provider_url?: string;
    author_name?: string;
    author_url?: string;
    author_icon_url?: string;
}
