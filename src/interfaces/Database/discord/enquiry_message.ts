/* AUTO CREATE TABLE INTERFACE :: 1738571724529 */
/*  */
type COLUMN = 'channel_id' | 'message_id' | 'create_at' | 'message';
const columns : COLUMN[] = [ 'channel_id','message_id','create_at','message' ];
const pk : COLUMN[] = [ 'channel_id','message_id' ];

export const ENQUIRY_MESSAGE = 'enquiry_message';
export const TABLE_COLUMNS_ENQUIRY_MESSAGE = columns;
const WHERE_ENQUIRY_MESSAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ENQUIRY_MESSAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.enquiry_message \nWHERE ${WHERE_ENQUIRY_MESSAGE(where)}`
export const INSERT_ENQUIRY_MESSAGE = (data: COLUMN[]) => ` INSERT INTO discord.ENQUIRY_MESSAGE SET ${WHERE_ENQUIRY_MESSAGE(data)} `
export const UPDATE_ENQUIRY_MESSAGE = (data: COLUMN[]) => ` UPDATE discord.ENQUIRY_MESSAGE SET ${WHERE_ENQUIRY_MESSAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ENQUIRY_MESSAGE = ` UPDATE discord.ENQUIRY_MESSAGE SET use_yn = 'N'`

export interface ENQUIRY_MESSAGE {
    channel_id: string;		/* KEY(PRI) varchar - * */
    message_id: string;		/* KEY(PRI) varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    message: any| null;		/*  json - * */
}