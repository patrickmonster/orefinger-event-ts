const convertBigint = (permission: string | bigint) =>
    typeof permission === 'string' ? BigInt(permission) : permission;

export const hasNot = (memberPermission: string | bigint, has: string | bigint) =>
    !(convertBigint(memberPermission) & convertBigint(has));
