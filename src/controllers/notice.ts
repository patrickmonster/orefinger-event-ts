import { query } from 'utils/database';

export const list = async () =>
    query<{
        notice_type_id: number;
        notice_type_tag: string;
    }>("select notice_type_id, tag as notice_type_tag from notice_type nt WHERE nt.use_yn = 'Y'");
