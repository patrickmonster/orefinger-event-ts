export interface Subscription {
    id: string;
    status: string;
    type: string;
    condition: {
        broadcaster_user_id?: string;
        moderator_user_id?: string;
        from_broadcaster_user_id?: string;
        to_broadcaster_user_id?: string;
        reward_id?: string;
        category_id?: string;
        client_id?: string;
        user_id?: string;
    };
}
