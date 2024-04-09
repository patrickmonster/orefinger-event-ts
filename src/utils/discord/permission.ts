export const hasNot = (memberPermission: string | bigint, has: bigint) =>
    !((typeof memberPermission === 'string' ? BigInt(memberPermission) : memberPermission) & has);
