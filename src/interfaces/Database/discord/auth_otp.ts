/* AUTO CREATE TABLE INTERFACE :: 1738571722971 */
/* 직접 결제 요청시, 중간에 OTP로 결제 인증(암호 안씀) */
type COLUMN = 'auth_id' | 'refresh_token' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'auth_id','refresh_token','create_at','update_at' ];
const pk : COLUMN[] = [  ];

export const AUTH_OTP = 'auth_otp';
export const TABLE_COLUMNS_AUTH_OTP = columns;
const WHERE_AUTH_OTP = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_OTP = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_otp \nWHERE ${WHERE_AUTH_OTP(where)}`
export const INSERT_AUTH_OTP = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_OTP SET ${WHERE_AUTH_OTP(data)} `
export const UPDATE_AUTH_OTP = (data: COLUMN[]) => ` UPDATE discord.AUTH_OTP SET ${WHERE_AUTH_OTP(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_OTP = ` UPDATE discord.AUTH_OTP SET use_yn = 'N'`

export interface AUTH_OTP {
    auth_id: string| null;		/*  char - * */
    refresh_token: string;		/*  text - * */
    create_at: Date;		/*  datetime - * */
    update_at: Date;		/*  datetime - * */
}