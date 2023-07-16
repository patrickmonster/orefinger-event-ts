export interface Subscription {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    condition: Condition;
    transport?: Transport;
    created_at?: string;
}

export interface Condition {
    broadcaster_user_id?: string;
    moderator_user_id?: string;
    from_broadcaster_user_id?: string;
    to_broadcaster_user_id?: string;
    reward_id?: string;
    category_id?: string;
    client_id?: string;
    user_id?: string;
}

export interface Transport {
    method: string;
    callback: string;
}

export interface Event {
    [key: string]: string | number | boolean | object;
}

export interface EventSub {
    subscription: Subscription;
    challenge?: string;
    event?: Event;
}
