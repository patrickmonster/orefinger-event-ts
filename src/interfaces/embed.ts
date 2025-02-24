import { APIEmbed } from 'discord-api-types/v10';
import { YN } from 'utils/database';

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

export interface EmbedUser {
    embed_id: number;
    title: string;
    description: string;
    url: string;
    timestamp: string;
    color: number;
    footer_text: string;
    footer_icon_url: string;
    icon_url: string;
    image: string;
    thumbnail: string;
    provider_name: string;
    provider_url: string;
    author_name: string;
    author_url: string;
    author_icon_url: string;
    create_at: string;
    update_at: string;
    create_user: string;
    update_user: string;
    use_yn: YN;
}
export interface Embed {
    embed_id: number;
    tag: string;
    url: string;
    color: number;
    image: string;
    thumbnail: string;
    title: string;
    description: string;
    provider: string;
    author: string;
    create_at: string;
    update_at: string;
} // ========================================================================================================
export interface UserEmbed {
    post_id: number;
    tag: string;
    hash_id: `mp-${string}-${string}`;
    message_id: number;
    embed_id: number;
    message: string;
    embed: APIEmbed;
    create_user: string;
    update_user: string;
    create_at: string;
    update_at: string;
}
