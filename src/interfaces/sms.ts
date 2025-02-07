export type SmsId = string;

export interface SmsLog {
    message_id: SmsId;
    message: string;
    type: string;
    is_send: string;
    return_message: string;
    phone: string;
    create_at: string;
    update_at: string;
}

export type SmsLogInsert = Omit<SmsLog, 'is_send' | 'create_at' | 'update_at'>;
export type SmsLogUpdate = Omit<SmsLog, 'message_id' | 'create_at' | 'update_at'>;
