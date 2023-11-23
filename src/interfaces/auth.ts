export type Auth_id = string;

export interface AuthUser {
    id: string;
    username?: string;
    discriminator?: string;
    email?: string;
    avatar?: string;
}
