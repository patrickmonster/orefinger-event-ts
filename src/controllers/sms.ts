// INSERT INTO discord.sms_log
// (message_id, message, `type`, is_send, create_at, update_at)
// VALUES('', '', '', 'N', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

import { SmsId, SmsLogUpdate } from 'interfaces/sms';
import { query, SqlInsertUpdate } from 'utils/database';

export const upsertSMSLog = async (id: SmsId, sms: SmsLogUpdate) =>
    query<SqlInsertUpdate>(
        `
INSERT INTO sms_log 
SET ?
ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP
        `,
        sms,
        { ...sms, message_id: id }
    );
