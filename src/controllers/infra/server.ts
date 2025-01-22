import { calTo, query } from 'utils/database';

export const selectServer = async ({ idx }: { idx?: number }) =>
    query<{
        id: number;
        name: string;
        ip: string;
        port: number;
        create_at: string;
    }>(
        `
SELECT
	idx
	, host
	, \`user\`
	, create_at
	, \`type\`
	, keyfile
FROM sys_orefinger.server
WHERE 1=1
${calTo(`AND idx = ?`, idx)}
        `
    );
